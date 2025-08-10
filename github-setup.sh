#!/bin/bash

# Replace 'your-username' with your actual GitHub username
# Replace 'iman-form-app' with your repository name if different

echo "Setting up GitHub remote..."
git remote add origin https://github.com/your-username/iman-form-app.git

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "Done! Your code is now on GitHub."
echo "Next steps:"
echo "1. Go to vercel.com"
echo "2. Import your GitHub repository"
echo "3. Add DATABASE_URL environment variable"
echo "4. Deploy!"
