# Deploying Testify to Vercel

This guide explains how to deploy the Testify application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for the database
3. A [Google AI Studio](https://ai.google.dev/) account for the Gemini API

## Deployment Steps

### 1. Prepare Your MongoDB Database

1. Create a MongoDB Atlas cluster
2. Set up a database user with appropriate permissions
3. Whitelist all IP addresses (0.0.0.0/0) for Vercel deployment
4. Get your MongoDB connection string

### 2. Set Up Your Vercel Project

1. Log in to your Vercel account
2. Click "Add New" and select "Project"
3. Import your GitHub repository
4. Configure the project:
   - Set the root directory to `/`
   - Set the build command to `npm run build`
   - Set the output directory to `client/dist`

### 3. Configure Environment Variables

Add the following environment variables in Vercel:

- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token generation
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FRONTEND_URL`: The URL of your deployed frontend (will be available after first deployment)

### 4. Deploy Your Project

1. Click "Deploy" to start the deployment process
2. Wait for the build and deployment to complete
3. Once deployed, update the `FRONTEND_URL` environment variable with the actual URL

### 5. Verify Deployment

1. Visit your deployed application
2. Test the login functionality
3. Verify that the API endpoints are working correctly

## Troubleshooting

### File Upload Issues

If you encounter issues with file uploads, check:
- The `/tmp/uploads` directory is being used correctly in production
- File permissions are set correctly

### API Connection Issues

If the frontend can't connect to the backend:
- Verify the `VITE_API_URL` is set correctly
- Check CORS settings in the server.js file

### Database Connection Issues

If the application can't connect to MongoDB:
- Verify the MongoDB connection string
- Ensure the database user has the correct permissions
- Check that IP whitelisting is configured correctly

## Maintenance

### Updating Your Deployment

1. Push changes to your GitHub repository
2. Vercel will automatically rebuild and redeploy your application

### Monitoring

Use Vercel's built-in monitoring tools to track:
- Deployment status
- Function execution
- Error logs
