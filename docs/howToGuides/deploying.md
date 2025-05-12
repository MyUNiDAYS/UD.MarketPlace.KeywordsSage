# How to Deploy a Feature or Change to Production

In this tutorial, we'll walk you through the process of deploying a new feature or change to production using CircleCI. This guide is designed to help you understand the entire process, from assigning a JIRA ticket to final deployment.

## Prerequisites

Before starting, ensure you have:

- Access to the relevant GitHub repository.
- Permissions to approve the CircleCI pipeline and deploy to production.
- A basic understanding of the Git flow and CI/CD processes used at UNiDAYS.

## Step 1: Assign a JIRA Ticket

Every change to the project should be tied to a **JIRA ticket** to ensure that the work is properly tracked. Follow these steps:

1. Identify the task you are working on and **assign** the corresponding **JIRA ticket** to yourself.
2. The ticket should clearly describe the feature or change you're implementing, whether it's a new feature, bug fix, or refactor.

## Step 2: Create a New Git Branch

Once you have your JIRA ticket assigned, create a new Git branch for your work. This branch should follow the naming convention for easier identification and better organization. Refer to the [Convention Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Step 3: Apply Your Changes

1. Implement the changes described in your JIRA ticket.
2. Ensure that your code adheres to any existing style guides or patterns used in the project. Write tests for any new functionality or features you've introduced.

## Step 4: Submit a Pull Request (PR)

Once you’ve completed your changes, it’s time to submit a **Pull Request** (PR) to merge your branch into the `main` branch. Make sure to provide the following details in your PR:

- A clear **title** describing what the changes are.
- A **description** of what changes you’ve made and why.
- A **link** to the JIRA ticket for context.


## Step 5: Review and Testing

1. **Review your own PR:** Review your work like it wasn't you who coded it
2. **Code Review**: Once the PR is submitted, ask a teammate to review the code. Address any feedback that comes from the review process.
3. **Testing**: Depending on your changes, you might need to run tests in an environment similar to production (using real AWS resources). This will help ensure your changes won’t break anything when deployed.

   If your changes require manual testing:

   1. You can **manually approve the deployment** on CircleCI by clicking the "Hold" button and then approving the job.

## **Step 6: Merging the PR to Main**

Once your PR has been reviewed and all checks have passed, it’s time to merge it into the `main` branch.

1. Go to your PR on **GitHub**.
2. Click the **Merge** button to finalize the deployment process.

## **Step 7: Automatic Deployment via CircleCI**

Once the PR is merged into `main`, **CircleCI will automatically trigger the deployment to production**. There is no need for manual intervention.

You can monitor the deployment progress by checking the **CircleCI pipeline**:  
[CircleCI Pipeline](https://app.circleci.com/projects/github/MyUNiDAYS/UD.MarketPlace.KeywordsSage)

If the deployment fails, investigate the logs in CircleCI and take the necessary steps to fix the issue.
