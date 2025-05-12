# How to Set Up the Project

This tutorial will guide you through the process of setting up the project on your local machine. By the end of this tutorial, you will have all necessary dependencies installed and the project ready for development.

## Prerequisites

Before proceeding, ensure that you have the following installed on your machine:

- **Node.js** (Recommended: latest LTS version)
- **pnpm** (Preferred package manager for this project)
- **Git** (To clone the repository)

## Step 1: Clone the Repository

Start by cloning the project repository to your local machine using Git:

```sh
 git clone https://github.com/MyUNiDAYS/UD.Marktplace.BloomReach-io.git
 cd UD.Marktplace.BloomReach-io
```

### Alternative: Using GitHub Desktop

If you prefer a graphical interface, you can use GitHub Desktop to clone the repository:

1. Open GitHub Desktop.
2. Click on **File > Clone Repository**.
3. Select the **URL** tab and paste the repository URL:  
   `https://github.com/MyUNiDAYS/UD.Marktplace.BloomReach-io.git`
4. Choose a local path to clone the repository and click **Clone**.

### Alternative: Using GitHub CLI

If you have GitHub CLI installed, you can clone the repository using the following command:

```sh
gh repo clone MyUNiDAYS/UD.MarketPlace.KeywordsSage
cd UD.MarketPlace.KeywordsSage
```

## Step 2: Install Dependencies

This project uses **pnpm** as the package manager. Run the following command to install all dependencies:

```sh
pnpm i
```

### Alternative: Installing `pnpm`

If you don't have `pnpm` installed, you can install it globally using `npm`:

```sh
npm install -g pnpm
```

Once installed, retry running:

```sh
pnpm i
```

## Summary

- Cloned the repository.
- Installed dependencies using `pnpm`.

Your project is now set up and ready for development!
