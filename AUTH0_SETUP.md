# Auth0 Integration Setup Guide

## 🔐 Overview

This guide will help you set up Auth0 authentication for the MCP Dashboard frontend application.

## 🚀 Quick Setup

### 1. Auth0 Account Setup

1. **Create Auth0 Account**: Go to [auth0.com](https://auth0.com) and create a free account
2. **Create Application**: 
   - Go to Applications → Create Application
   - Choose "Single Page Web Applications"
   - Select React as the technology

### 2. Auth0 Application Configuration

In your Auth0 dashboard, configure the following URLs:

**Allowed Callback URLs:**
```
http://localhost:3002/callback
```

**Allowed Logout URLs:**
```
http://localhost:3002
```

**Allowed Web Origins:**
```
http://localhost:3002
```

**Allowed Origins (CORS):**
```
http://localhost:3002
```

### 3. Environment Configuration

Update your `.env.local` file with your Auth0 credentials:

```bash
# Auth0 Configuration
AUTH0_SECRET='0ce9880a40b967952e8e6b786a5d288ed4a49469769089c884a64d8dd90222b5'
AUTH0_BASE_URL='http://localhost:3002'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your_client_id_from_auth0'
AUTH0_CLIENT_SECRET='your_client_secret_from_auth0'
```

Replace the following values:
- `YOUR_AUTH0_DOMAIN` → Your Auth0 domain (e.g., `dev-abc123.us.auth0.com`)
- `your_client_id_from_auth0` → Client ID from your Auth0 application
- `your_client_secret_from_auth0` → Client Secret from your Auth0 application

## 🔧 Features Implemented

### ✅ Authentication Flow
- **Login Page**: Beautiful, responsive login interface
- **Secure Authentication**: Auth0 OAuth 2.0 with PKCE
- **Session Management**: HTTP-only cookies with automatic expiration
- **Logout**: Secure logout with Auth0 and local session cleanup

### ✅ Protected Routes
- **Middleware Protection**: Next.js middleware automatically redirects unauthenticated users
- **Component Protection**: `<ProtectedRoute>` wrapper for additional security
- **Dashboard Access**: Only authenticated users can access the dashboard

### ✅ User Interface
- **User Profile**: Dedicated profile page with user information
- **Navigation**: User menu with profile and logout options
- **Responsive Design**: Mobile-first design with Tailwind CSS

### ✅ Security Features
- **HTTP-only Cookies**: Session data stored securely
- **Session Expiration**: Automatic logout when tokens expire
- **CSRF Protection**: Built-in protection against CSRF attacks
- **Secure Headers**: Security headers for production deployment

## 🎯 Usage

### Starting the Application

1. **Start the backend** (if not already running):
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Open http://localhost:3002
   - You'll be automatically redirected to the login page
   - Click "Sign in with Auth0" to authenticate

### Authentication Flow

1. **User visits the application** → Redirected to `/login`
2. **Clicks "Sign in with Auth0"** → Redirected to Auth0 login
3. **Completes Auth0 authentication** → Redirected back with authorization code
4. **Backend exchanges code for tokens** → Creates secure session
5. **User redirected to dashboard** → Full access to MCP features

## 🛠️ Customization

### Custom Login Styling
The login page is located at `src/app/login/page.tsx` and can be fully customized.

### User Profile Enhancement
Add more user information in `src/components/auth/UserProfile.tsx`.

### Additional Auth0 Features
- **Social Logins**: Enable Google, Facebook, GitHub, etc. in Auth0
- **Multi-Factor Authentication**: Enable MFA in Auth0 security settings
- **User Roles**: Configure roles and permissions in Auth0

### Environment-specific Configuration

For production deployment, update the URLs in both Auth0 and your environment:

```bash
# Production Environment
AUTH0_BASE_URL='https://your-domain.com'
AUTH0_ISSUER_BASE_URL='https://your-auth0-domain.auth0.com'
```

## 🔐 Security Considerations

1. **Never commit secrets**: Keep `.env.local` in `.gitignore`
2. **Use HTTPS in production**: Auth0 requires HTTPS for production apps
3. **Rotate secrets regularly**: Update Auth0 client secrets periodically
4. **Monitor Auth0 logs**: Check Auth0 dashboard for suspicious activities

## 🐛 Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Check that callback URLs match exactly in Auth0 settings
- Ensure no trailing slashes in URLs

**"Invalid client"**
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Check that the application type is set to "Single Page Application"

**Session not persisting**
- Verify AUTH0_SECRET is set and is 32+ characters
- Check browser cookies are enabled
- Ensure AUTH0_BASE_URL matches your actual URL

**CORS errors**
- Add your domain to "Allowed Origins (CORS)" in Auth0
- Check that all URLs are configured correctly

## 📚 Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Next.js Auth0 SDK](https://github.com/auth0/nextjs-auth0)
- [Auth0 Dashboard](https://manage.auth0.com)

## 🎉 Success!

Once configured, your MCP Dashboard will have enterprise-grade authentication with:
- Secure user sessions
- Beautiful login interface  
- Protected routes
- User profile management
- Automatic session handling

The integration maintains all existing MCP functionality while adding robust security!
