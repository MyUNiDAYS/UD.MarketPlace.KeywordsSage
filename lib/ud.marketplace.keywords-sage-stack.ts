/* eslint-disable max-lines */
import * as cdk from "aws-cdk-lib";
import * as applicationautoscaling from "aws-cdk-lib/aws-applicationautoscaling";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import path from "path";

import { generateResourcename } from "./helpers/generateResourceName";
import { EnvVariablesSchema, getProcessEnvVariables } from "./helpers/types";

export class UdMarketplaceKeywordsSageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const { ENV } = getProcessEnvVariables(EnvVariablesSchema);

    const tags: Record<string, string> = {
      "ud:domain": "UD.Marketplace",
      "ud:system": "Keywords-Sage",
      "ud:maintainers": "web.team@myunidays.com",
      "ud:git-repo": "https://github.com/MyUNiDAYS/UD.MarketPlace.KeywordsSage",
      "ud:env": ENV,
    };

    Object.keys(tags).forEach((key) => {
      cdk.Tags.of(this).add(key, tags[key]);
    });

    const keywordsSageTaskRole = new iam.Role(this, "KeywordsSageTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      roleName: generateResourcename("KeywordsSageTaskRole"),
      description: "Role for KeywordsSage ECS task with Bedrock access",
    });

    keywordsSageTaskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: ["*"], // For more restrictive permissions, you can specify the model ARN
      })
    );

    const keyWordsSageTaskDef = new ecs.TaskDefinition(
      this,
      "KeywordsSageTaskDef",
      {
        memoryMiB: "512",
        cpu: "256",
        compatibility: ecs.Compatibility.EC2,
        networkMode: ecs.NetworkMode.BRIDGE,
        family: generateResourcename("KeywordsSageTaskDef"),
        taskRole: keywordsSageTaskRole,
      }
    );

    keyWordsSageTaskDef.addContainer("KeywordsSageContainer", {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, "../"), {
        file: "Dockerfile",
      }),
      logging: new ecs.AwsLogDriver({
        streamPrefix: "keywordsSageContainer",
      }),
      portMappings: [
        {
          containerPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
      ],
      containerName: "keywordsSageContainer",
    });

    const vpcId = ENV == "dev" ? "vpc-5a64083c" : "vpc-ed997485";

    new cdk.CfnOutput(this, "VpcIdOutput", {
      value: vpcId,
      description: "The imported VPC ID",
    });

    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      vpcId,
    });

    const keywordsSageTaskTargetGroup = new elbv2.ApplicationTargetGroup(
      this,
      "KeywordsSageTaskTargetGroup",
      {
        vpc,
        port: 3000,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.INSTANCE,
        healthCheck: {
          path: "/health",
          timeout: cdk.Duration.seconds(5),
          interval: cdk.Duration.seconds(30),
          healthyThresholdCount: 5,
          unhealthyThresholdCount: 2,
        },
        targetGroupName: "KeywordsSageTaskTargetGroup",
      }
    );

    keywordsSageTaskTargetGroup.setAttribute(
      "load_balancing.algorithm.type",
      "round_robin"
    );

    const clusterImport = cdk.Fn.importValue("Services-ECS-Cluster");
    const capacityProviderImport = cdk.Fn.importValue(
      "Services-ECS-InternetCapacityProvider"
    );

    const httpsListenerArn =
      ENV === "dev"
        ? "arn:aws:elasticloadbalancing:eu-west-1:544207747350:listener/app/APIServices-External/80acd573b18e6a4d/124b0e333064ee4d"
        : "arn:aws:elasticloadbalancing:eu-west-1:397592739218:listener/app/APIServices-External/746f127a6e2c32d8/d3824c49fa7fa88a";

    const hostHeaders =
      ENV === "dev"
        ? "keywords-sage.dev.unidays.io"
        : "keywords-sage.prod.unidays.io";

    const lbFullName =
      ENV === "dev"
        ? "app/APIServices-External/80acd573b18e6a4d"
        : "app/APIServices-External/746f127a6e2c32d8";

    new elbv2.ApplicationListenerRule(this, "KeywordsSageListenerRule", {
      listener: elbv2.ApplicationListener.fromLookup(this, "Listener", {
        listenerArn: httpsListenerArn,
      }),
      priority: 205,
      conditions: [
        elbv2.ListenerCondition.httpRequestMethods(["POST"]),
        elbv2.ListenerCondition.pathPatterns(["/generate-keywords"]),
        elbv2.ListenerCondition.hostHeaders([hostHeaders]),
      ],
      action: elbv2.ListenerAction.forward([keywordsSageTaskTargetGroup]),
    });

    const keywordsSageService = new ecs.CfnService(
      this,
      "KeywordsSageService",
      {
        cluster: clusterImport,
        capacityProviderStrategy: [
          {
            capacityProvider: capacityProviderImport,
            weight: 1,
          },
        ],
        desiredCount: 1,
        healthCheckGracePeriodSeconds: 30,
        loadBalancers: [
          {
            containerName: "keywordsSageContainer",
            containerPort: 3000,
            targetGroupArn: keywordsSageTaskTargetGroup.targetGroupArn,
          },
        ],
        taskDefinition: keyWordsSageTaskDef.taskDefinitionArn,
        enableEcsManagedTags: true,
        propagateTags: "TASK_DEFINITION",
        placementStrategies: [
          {
            field: "attribute:ecs.availability-zone",
            type: "spread",
          },
          {
            field: "instanceId",
            type: "spread",
          },
        ],
        tags: [
          {
            key: "ud:owner",
            value: "WebTeam",
          },
        ],
      }
    );

    const scalableTarget = new applicationautoscaling.ScalableTarget(
      this,
      "KeywordsSageScalability",
      {
        serviceNamespace: applicationautoscaling.ServiceNamespace.ECS,
        maxCapacity: 2,
        minCapacity: 1,
        resourceId: `service/${clusterImport}/${keywordsSageService.attrName}`,
        scalableDimension: "ecs:service:DesiredCount",
      }
    );

    scalableTarget.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeClusters",
          "application-autoscaling:*",
          "cloudwatch:DescribeAlarms",
          "cloudwatch:GetMetricStatistics",
        ],
        resources: [`*`],
      })
    );

    new applicationautoscaling.TargetTrackingScalingPolicy(
      this,
      "KeywordsSageTargetTrackingPolicy",
      {
        policyName: "KeywordsSageTargetTrackingPolicy",
        scalingTarget: scalableTarget,
        targetValue: 200,
        predefinedMetric:
          applicationautoscaling.PredefinedMetric.ALB_REQUEST_COUNT_PER_TARGET,
        resourceLabel: `${lbFullName}/${keywordsSageTaskTargetGroup.targetGroupFullName}`,
        scaleInCooldown: cdk.Duration.seconds(60),
        scaleOutCooldown: cdk.Duration.seconds(60),
      }
    );
  }
}
