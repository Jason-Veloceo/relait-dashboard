# Full-Stack AWS Template

This is a full-stack template project for building applications with AWS and Next.js.

## Getting started
To create a new project, you go to `/paths`, choose from our list of Paths, and then use Cursor's Composer feature to quickly scaffold your project!

You can also edit the Path's prompt template to be whatever you like!

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the required environment variables (see below)

4. Run the development server:
```bash
npm run dev
```

## Technologies used
This doesn't really matter, but is useful for the AI to understand more about this project. We are using the following technologies:
- React with Next.js 14 App Router
- TailwindCSS
- AWS Authentication (Cognito) and Storage (S3)
- PostgreSQL database
- Multiple AI endpoints including OpenAI, Anthropic, and Replicate using Vercel's AI SDK

## Environment Variables

Create a `.env.local` file with the following variables:

```
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=your-aws-region
NEXT_PUBLIC_AWS_USER_POOL_ID=your-cognito-user-pool-id
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your-cognito-client-id
NEXT_PUBLIC_S3_BUCKET=your-s3-bucket-name

# PostgreSQL Configuration
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DATABASE=your-database-name
POSTGRES_SSL=true
```

## AWS Configuration

1. **Create a Cognito User Pool:**
   - Go to the AWS Management Console > Cognito > User Pools
   - Create a new user pool with the desired settings
   - Note your User Pool ID and App Client ID for environment variables

2. **Create an S3 Bucket:**
   - Go to the AWS Management Console > S3
   - Create a new bucket for file storage
   - Configure CORS settings to allow your application domain

3. **Set up appropriate IAM policies** for your application to access these resources

## PostgreSQL Setup

1. **Create a PostgreSQL Database:**
   - You can use Amazon RDS for PostgreSQL or any other PostgreSQL provider
   - Set up a database with appropriate users and permissions
   - Note the connection details for your environment variables