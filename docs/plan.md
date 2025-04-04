# Beardy App - Development Plan

This document provides a step-by-step implementation plan for developing the Beardy MVP. Each task is broken down into smaller, manageable pieces to guide development in a logical sequence, with integrated quality assurance checks.

## Phase 1: Project Setup & Infrastructure (Week 1)

### 1. Development Environment Setup

1. **Initialize Expo Project**
   ```bash
   npx create-expo-app beardy --template blank-typescript
   cd beardy
   ```

2. **Initialize Git Repository**
   ```bash
   git init
   echo "node_modules\n.expo\ndist\nnpm-debug.*\n*.jks\n*.p8\n*.p12\n*.key\n*.mobileprovision\n*.orig.*\nweb-build/\n.env*" > .gitignore
   git add .
   git commit -m "Initial commit"
   ```

3. **Install Core Dependencies**
   ```bash
   npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
   npm install @supabase/supabase-js
   npm install expo-secure-store expo-image-picker expo-linking expo-status-bar
   npm install react-native-safe-area-context react-native-screens
   npm install react-native-dotenv
   ```

4. **Setup Environment File**
   ```bash
   # Create .env file
   echo "SUPABASE_URL=your_supabase_url\nSUPABASE_ANON_KEY=your_supabase_anon_key" > .env
   # Add .env to .gitignore!
   ```

5. **Add babel configuration for .env support**
   * Edit `babel.config.js` to include:
   ```javascript
   module.exports = function(api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         ["module:react-native-dotenv", {
           "moduleName": "@env",
           "path": ".env",
           "blacklist": null,
           "whitelist": null,
           "safe": false,
           "allowUndefined": true
         }]
       ]
     };
   };
   ```

6. **Configure Linting & Formatting**
   * Set up ESLint and Prettier with strict rules (React Hooks, TypeScript).
   * Configure TypeScript `tsconfig.json` for `"strict": true`.

### 2. Supabase Project Setup

1. **Create a new Supabase project** via the Supabase dashboard

2. **Configure Authentication**
   * Enable Email/Password sign-up in Supabase Auth settings
   * Disable email confirmation for MVP if desired
   * Configure redirect URLs for password reset

3. **Create Database Tables**
   * Run SQL scripts to create all tables with proper relationships:
     * `profiles`
     * `posts`
     * `comments`
     * `likes`
     * `resource_categories`
     * `resources`
     * `chat_history`

4. **Set Up Row-Level Security Policies**
   * Create RLS policies for each table as defined in data structures

5. **Create Storage Buckets**
   * Create `post-images` bucket with appropriate permissions
   * Create `resource-images` bucket with appropriate permissions

### 3. Configure Edge Functions for AI

1. **Initialize Supabase CLI for Edge Functions**
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **Create AI Chat Edge Function**
   ```bash
   supabase functions new ai-chat
   ```

3. **Implement Claude API Integration**
   * Code the edge function to format prompts for Claude
   * Set up proper error handling and response formatting
   * Use structured response format for the app to parse

4. **Set Secrets for API Keys**
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=your_api_key # Never commit keys!
   ```

5. **Deploy the Edge Function**
   ```bash
   supabase functions deploy ai-chat
   ```

### 4. Setup Crash Reporting & Logging

1. **Choose and Integrate Service** (e.g., Sentry, Bugsnag)
2. **Configure for Expo/React Native**
3. **Initialize Early in App Lifecycle** (`App.tsx`)
4. **Test Basic Error Capture** (throw a test error in dev mode)

## Phase 2: Core App Structure & Authentication (Week 1-2)

### 1. App Navigation & Structure

1. **Create App Navigation Structure**
   * Set up React Navigation with bottom tabs
   * Create placeholders for all main screens:
     * Explore (default)
     * Feed
     * AI Vet
     * Settings

2. **Implement Theme & Styling**
   * Create a theme file with colors, typography, spacing
   * Implement shared components (buttons, cards, inputs)
   * Set up global styles and constants

3. **App Entry Point**
   * Set up App.tsx with navigation and theme provider
   * Add state management for authentication

4. **Implement Basic Error Boundaries** around main navigation/sections.

### 2. Authentication Flow

1. **Implement Supabase Client**
   * Create a utility file to initialize and export Supabase client
   * Set up secure storage for session persistence

2. **Create Authentication Context**
   * Implement a React Context for auth state
   * Add hooks for login, signup, logout functionality

3. **Create Onboarding Screens**
   * Implement welcome/feature highlight screens
   * Add navigation between screens with progress indicators

4. **Build Sign Up Flow**
   * Create the Sign Up form with validation
   * Implement the Username creation form
   * Add error handling and loading states

5. **Build Sign In Flow**
   * Create the Sign In form with validation
   * Implement "Forgot Password" functionality
   * Add error handling and loading states

6. **Implement Auth Navigation**
   * Create conditional navigation based on auth state
   * Protect routes that require authentication

### 3. QA Checkpoint 1: Auth & Navigation

1. **Build Local Production App:**
   ```bash
   eas build --profile production --platform ios --local
   ```
2. **Test on Simulator & Device:** Install the build and thoroughly test:
   * Onboarding flow
   * Sign Up (including username validation)
   * Sign In
   * Forgot Password flow
   * Log Out
   * Basic navigation between tabs (even if empty)
   * Check crash reporting for any unexpected errors.

## Phase 3: Explore Tab (Resources Hub) Implementation (Week 2)

### 1. Resource Data Management

1. **Create Admin Tools** (separate from app, for content management)
   * Simple form to add/edit resource categories
   * Form to create/edit resource articles
   * Upload functionality for resource images

2. **Populate Initial Content**
   * Add basic categories (Habitat, Diet, Health, Behavior)
   * Create at least 2-3 articles per category for MVP

### 2. Explore Tab UI

1. **Implement Main Explore Screen**
   * Create horizontal category lists
   * Build resource card components
   * Add "See All" functionality for categories

2. **Implement Category Detail Screen**
   * Display full vertical list of resources in a category
   * Sort by display_order
   * Handle empty state and loading

3. **Implement Article Detail Screen**
   * Display article content with proper formatting
   * Support markdown or HTML in content
   * Handle image display

4. **Add Data Fetching**
   * Connect UI to Supabase queries
   * Implement caching for better performance
   * Add loading and error states

5. **Implement `FlatList` optimizations** for category/article lists.

### 3. QA Checkpoint 2: Explore Tab

1. **Build Local Production App:** (`eas build --local`)
2. **Test on Simulator & Device:**
   * Navigation within Explore tab (main -> category -> article -> back)
   * Image loading performance and placeholders
   * Content rendering and formatting
   * Loading and error states for data fetching
   * Check crash reporting.

## Phase 4: Social Feed Implementation (Week 3)

### 1. Feed Core Functionality

1. **Implement Feed Screen**
   * Create post card component
   * Display posts in reverse chronological order
   * Add pull-to-refresh functionality

2. **Build Post Creation**
   * Create "New Post" form
   * Implement image picker functionality
   * Add post submission with proper error handling

3. **Implement Like Functionality**
   * Add like button with toggle logic
   * Update UI based on user's like status
   * Implement optimistic updates for better UX

4. **Ensure Proper `FlatList` Usage** for the feed.

### 2. Comments & Detail Views

1. **Create Post Detail Screen**
   * Display full post content
   * Show comments section
   * Add comment input field

2. **Implement Comments Functionality**
   * Fetch and display comments
   * Add comment submission
   * Update comment list after posting

3. **Add Admin Moderation** (if you're an admin)
   * Add delete functionality for posts/comments
   * Create simple report mechanism

### 3. QA Checkpoint 3: Social Feed

1. **Build Local Production App:** (`eas build --local`)
2. **Test on Simulator & Device:**
   * Scrolling performance of the feed
   * Creating posts (text only, with image)
   * Image upload success/failure handling
   * Liking/unliking posts (check persistence)
   * Viewing post details
   * Adding comments (check persistence)
   * Pull-to-refresh functionality
   * Check crash reporting.

## Phase 5: AI Vet Chat Implementation (Week 3-4)

### 1. Chat UI Implementation

1. **Create Chat Interface**
   * Build chat bubbles for user and AI
   * Implement scrollable chat history
   * Add message input and send button

2. **Add Message Persistence**
   * Save chat history to Supabase
   * Load previous conversations
   * Group messages by conversation

### 2. AI Integration

1. **Connect to Edge Function**
   * Set up API call to Supabase Edge Function
   * Pass user message and conversation context
   * Parse and display AI response

2. **Implement Error Handling**
   * Add retry mechanism for failed calls
   * Display appropriate error messages
   * Handle rate limiting and service unavailability

3. **Add Loading States**
   * Show typing indicator while waiting for response
   * Disable input during processing
   * Ensure good UX during network delays

### 3. QA Checkpoint 4: AI Vet

1. **Build Local Production App:** (`eas build --local`)
2. **Test on Simulator & Device:**
   * Sending messages and receiving responses
   * Conversation history persistence across sessions
   * Loading and error state handling for AI responses
   * Scrolling performance with long conversations
   * Check crash reporting.

## Phase 6: Settings & Profile Management (Week 4)

### 1. Settings UI

1. **Create Settings Screen**
   * Display user information
   * Add all settings options
   * Implement navigation to sub-screens

2. **Implement Account Management**
   * Add password change functionality
   * Create logout flow with confirmation
   * Display app information

3. **Create Support/Legal Pages**
   * Add basic FAQ content
   * Implement Terms of Service and Privacy Policy screens
   * Add contact/feedback option

### 2. QA Checkpoint 5: Settings

1. **Build Local Production App:** (`eas build --local`)
2. **Test on Simulator & Device:**
   * Display of user info
   * Change Password flow (success and failure)
   * Log Out flow
   * Navigation to all support/legal pages
   * Check crash reporting.

## Phase 7: End-to-End Testing & Refinement (Week 4-5)

### 1. Comprehensive Production Build Testing

1. **Generate TestFlight Build:**
   ```bash
   eas build --profile production --platform ios
   ```
2. **Distribute via TestFlight** to internal testers.
3. **Execute Test Plan:**
   * Test *all* user flows from `userflows.md` on multiple devices (different models/iOS versions if possible).
   * Specifically test edge cases (no network, invalid inputs, large images, long text).
   * Test transitions between different app states (background, foreground, low memory).
4. **Monitor Crash Reporting:** Actively monitor Sentry/Bugsnag for issues reported from TestFlight builds.

### 2. Refinement & Bug Fixing

1. **Address TestFlight Feedback:** Fix bugs and usability issues identified.
2. **Performance Optimization:**
   * Profile app performance on devices using Xcode Instruments/Android Profiler if needed.
   * Optimize image loading, list rendering, and bundle size.
3. **Iterate:** Perform additional TestFlight builds (QA Checkpoint 6, 7...) after significant fixes or refinements.

## Phase 8: Deployment & Release Preparation (Week 5)

### 1. Prepare for App Store

1. **Create App Assets**
   * Design app icon
   * Prepare screenshots
   * Write app description

2. **Configure Expo for Release Build**
   * Set up app.json with proper configuration
   * Set version number and bundle identifier
   * Configure permissions

3. **Final Production Build & Submit**
   ```bash
   eas submit --profile production --platform ios # Or eas build and upload manually
   ```
   * Submit to App Store Connect with all required metadata.

### 2. Final Documentation

1. **Update Technical Documentation**
   * Document API endpoints
   * Describe database structure
   * Note any limitations or known issues

2. **Create User Guide/FAQ**
   * Document key features
   * Add troubleshooting section
   * Include privacy information

## Timeframe and Milestones

* **Week 1**: Project setup, infrastructure, auth flow, QA Checkpoint 1
* **Week 2**: Explore tab, begin Feed, QA Checkpoint 2
* **Week 3**: Complete Feed, begin AI Vet, QA Checkpoint 3
* **Week 4**: Complete AI Vet, Settings, QA Checkpoints 4 & 5, Begin End-to-End Testing
* **Week 5**: Comprehensive Testing (TestFlight), Refinement, Deployment Prep

## Development Tips

*   **Test Prod Builds Often:** Do not wait until the end. Local prod builds (`eas build --local`) are key.
*   **Use Crash Reporting Early:** Integrate and monitor from the start.
*   **Handle All Promises:** Ensure every promise has a `.catch()`.
*   **Validate Dependencies:** Check compatibility with Expo/EAS Build.
*   **Test on Real Devices:** Simulators don't catch everything.
*   **Version Control Best Practices**
    * Commit frequently with descriptive messages
    * Create feature branches for each major component
    * Review code before merging
*   **Performance Considerations**
    * Use FlatList for long scrolling lists
    * Implement lazy loading for images
    * Minimize state updates in scrolling components
*   **Debugging Tools**
    * Use React DevTools for component inspection
    * Monitor Supabase logs for backend issues
    * Use console.log strategically (remove before production)

## Common Issues and Solutions

*   **Authentication Problems**
    * Verify Supabase configuration
    * Check for expired tokens
    * Ensure proper error handling
*   **Image Upload Issues**
    * Verify storage bucket permissions
    * Check file size and format
    * Add proper error handling for uploads
*   **React Navigation Issues**
    * Ensure latest versions of dependencies
    * Check for nested navigator problems
    * Verify route names and parameters
*   **Supabase Query Problems**
    * Verify RLS policies
    * Check for incorrect foreign keys
    * Test queries in Supabase dashboard first
*   **Prod Build Crashes:** Often related to unhandled errors, incompatible native modules, incorrect environment variables, or asset bundling issues. Check EAS build logs and crash reporter diligently. 