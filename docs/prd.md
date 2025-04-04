# Beardy App - Product Requirements Document (MVP)

## 1. Introduction

Beardy is a mobile companion app for bearded dragon owners designed to provide community support, AI-driven care advice, and curated resources. The app aims to combine social sharing, educational content, and instant AI assistance in a single, beautifully designed interface inspired by the successful Blossom plant care app.

## 2. Goals

*   **MVP Goal:** Validate the core concept and achieve user growth on the iOS platform. Success is measured by attracting and retaining new users.
*   **Key Performance Indicators (KPIs):**
    *   User acquisition rate
    *   Retention rate (1-day, 7-day)
    *   Session frequency and duration
    *   Feature engagement (% of users engaging with each core feature)
*   **Long-Term Vision:** Become the go-to resource and community hub for bearded dragon enthusiasts.

## 3. Target Audience

*   Primary: Bearded dragon owners, ranging from new/prospective owners to experienced keepers.
*   Secondary: Reptile enthusiasts and potential bearded dragon owners researching care requirements.
*   Tertiary: Veterinarians and reptile specialists who may recommend the app to their clients.

## 4. Core Features (MVP)

1.  **Explore Tab (Default View):**
    *   Displays curated resources (articles, guides) organized by category (e.g., Habitat, Diet, Health).
    *   Users can browse categories and read detailed articles.
    *   Content is manually created for the MVP.
    *   Categories should include at minimum: Habitat Setup, Diet & Nutrition, Health & Wellness, and Behavior & Handling.
    *   Each article should include high-quality images and well-structured text content.

2.  **Social Feed Tab:**
    *   Reddit-like feed (`r/beardeddragon` style) showing user-generated posts in reverse chronological order.
    *   Users can create posts with text and images (multiple images in future versions).
    *   Users can like and comment on posts.
    *   Content is exclusively from Beardy app users.
    *   Admin moderation required (deletion capabilities).
    *   Posts should display username, timestamp, content, like count, and comment count.

3.  **AI "Vet" Tab:**
    *   Chat interface allowing users to ask bearded dragon care questions.
    *   Powered by an LLM (e.g., Claude) via Supabase Edge Function, using a system prompt positioning it as a bearded dragon care expert.
    *   Includes clear disclaimers that it is not a substitute for professional veterinary advice (in UI and within responses).
    *   Conversation history is persisted per user across sessions.
    *   Handles network errors gracefully with appropriate feedback.

4.  **Settings Tab:**
    *   User profile creation (Username) during sign-up.
    *   Basic account management: Display user email, Change Password, Log Out.
    *   Links to Support/FAQ, Contact/Feedback, Terms of Service, Privacy Policy.
    *   Display App Version.

## 5. Technology Stack

*   **Frontend:** 
    *   Expo (React Native) targeting iOS initially
    *   React Navigation for screen navigation
    *   Expo Image Picker for photo uploads
    *   AsyncStorage or similar for local caching

*   **Backend:** 
    *   Supabase (Database, Auth, Storage, Edge Functions)
    *   PostgreSQL database managed by Supabase
    *   Supabase Auth for user authentication
    *   Supabase Storage for media files

*   **AI:** 
    *   Anthropic Claude (or similar LLM) accessed via Supabase Edge Function
    *   Edge Function to handle message formatting and API communication

## 6. Authentication & Authorization

*   **Sign Up/Sign In:** Required to access the app. Email/Password for MVP (Google/Apple sign-in considered for future).
*   **Profile:** Users create a profile (Username) immediately after signing up.
*   **Authorization:** Row Level Security (RLS) in Supabase will be used to control data access:
    *   Public content: Visible to all authenticated users
    *   User content: Editable/deletable only by the creating user
    *   Admin functions: Limited to admin role users

## 7. UI/UX Design

*   **Inspiration:** Heavily inspired by the clean, intuitive, and image-rich design of the "Blossom" Plantcare app.
*   **Style:** 
    *   Soft aesthetics with rounded corners
    *   Clear typography with consistent hierarchies
    *   Card-based layouts for content display
    *   High-quality imagery throughout the app
    *   Warm/earthy color palette appropriate for bearded dragon theme
*   **Navigation:** Bottom tab bar for main sections (Explore, Feed, AI Vet, Settings).
*   **Responsiveness:** UI should adapt to different iOS device sizes (iPhone SE to Pro Max).

## 8. Credential Management

*   Sensitive keys (Anthropic API Key, Supabase service_role key if needed) stored securely using Supabase secrets management for Edge Functions.
*   Supabase URL and Anon key managed via environment variables in the Expo app.
*   No hardcoding of secrets in frontend code or version control.
*   Proper session token management for authentication persistence.

## 9. Error Handling & Edge Cases

*   **Network Connectivity:**
    *   App should handle offline states gracefully
    *   Display appropriate error messages for connectivity issues
    *   Retry mechanisms for failed API calls
*   **Image Loading:**
    *   Placeholder or skeleton UI while images load
    *   Fallback for failed image loads
*   **Empty States:**
    *   Appropriate messaging for empty feed/search results
    *   Guidance for users on how to proceed
*   **Validation:**
    *   Input validation for user submissions
    *   Appropriate error messages for invalid inputs

## 10. Future Considerations (Post-MVP)

*   Apple Sign-In and Google Sign-In integration
*   Push notifications for social interactions
*   Image recognition for bearded dragon health issues
*   Advanced profile features (multiple dragons, care schedules)
*   Community Q&A section separate from the feed
*   Direct messaging between users
*   Search functionality across all content

## 11. Legal & Compliance

*   Privacy Policy and Terms of Service must be in place before launch
*   Clear disclaimers regarding AI vet advice not replacing professional veterinary care
*   GDPR/CCPA compliance considerations
*   Appropriate content moderation policies

## 12. Quality Assurance & Release Strategy

To mitigate risks associated with discrepancies between development and production environments, the following quality assurance practices are mandatory for the MVP release:

*   **Frequent Production Build Testing:** Regular local production builds using EAS Build (`eas build --local`) must be performed and tested on simulators and physical devices throughout development, not just before release.
*   **Robust Error Handling:** Implement comprehensive error handling, including React Error Boundaries, explicit `try...catch` blocks where appropriate, and `.catch()` handlers for all promises.
*   **Crash Reporting & Logging:** Integrate a production-grade crash reporting and remote logging service (e.g., Sentry) early in the development cycle to capture issues occurring in TestFlight and production builds.
*   **Dependency Scrutiny:** Carefully vet all dependencies, especially those with native code, for compatibility with Expo SDK and EAS Build.
*   **Strict Code Quality:** Adhere to strict TypeScript settings and linting rules.
*   **TestFlight Validation:** Thorough testing of all features and edge cases must be performed on builds distributed via TestFlight before final release consideration.
*   **Performance Monitoring:** Basic performance checks (list scrolling, startup time) should be conducted on production builds on representative devices. 