#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import {UdMarketplaceKeywordsSageStack} from "../lib/ud.marketplace.keywords-sage-stack";
const app = new App();

new UdMarketplaceKeywordsSageStack(app, "UdMarketplaceKeywordsSageStack", {
    stackName: "UdMarketplaceKeywordsSageStack",
});

