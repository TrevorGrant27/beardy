# Beardy App - User Flows (MVP)

This document outlines the key user flows for the Beardy MVP, detailing the step-by-step interactions a user will experience.

## 1. Initial App Launch & Onboarding (First Time / Logged Out)

1.  **Screen 1: Welcome**
    *   **Display:**
        *   App logo ("Beardy")
        *   Tagline ("Your bearded dragon companion")
        *   High-quality bearded dragon image/illustration
        *   Progress indicator (1/5)
    *   **Actions:**
        *   Primary: "Get Started" button
        *   Secondary: "Skip" link (top right, navigates to Sign Up/In screen)
        *   Gesture: Swipe left to advance

2.  **Screen 2: Highlight Social Feed**
    *   **Display:**
        *   Illustration or mockup of the Social Feed
        *   Heading: "Connect with the Community"
        *   Description: "Share photos, ask questions, and learn from fellow bearded dragon enthusiasts."
        *   Progress indicator (2/5)
    *   **Actions:**
        *   Navigation: "Next" and "Previous" buttons
        *   Secondary: "Skip" link (top right)
        *   Gesture: Swipe left/right to navigate

3.  **Screen 3: Highlight AI Vet**
    *   **Display:**
        *   Illustration of the AI chat interface
        *   Heading: "Instant Care Advice"
        *   Description: "Get quick answers to your bearded dragon questions from our AI assistant."
        *   Progress indicator (3/5)
    *   **Actions:**
        *   Navigation: "Next" and "Previous" buttons
        *   Secondary: "Skip" link (top right)
        *   Gesture: Swipe left/right to navigate

4.  **Screen 4: Highlight Explore Hub**
    *   **Display:**
        *   Visual representation of resource categories
        *   Heading: "Expert Care Resources"
        *   Description: "Access guides on diet, habitat, health, and more from verified sources."
        *   Progress indicator (4/5)
    *   **Actions:**
        *   Navigation: "Next" and "Previous" buttons
        *   Secondary: "Skip" link (top right)
        *   Gesture: Swipe left/right to navigate

5.  **Screen 5: Sign Up / Sign In Prompt**
    *   **Display:**
        *   Heading: "Join Beardy"
        *   Subtitle: "Create an account to unlock all features"
        *   Progress indicator (5/5)
    *   **Actions:**
        *   Primary: "Sign Up" button (prominent)
        *   Secondary: "Sign In" link (for existing users)
        *   Navigation: "Previous" button
        *   Gesture: Swipe right to previous screen

## 2. Sign Up Flow

1.  **Trigger:** User taps "Sign Up" from onboarding or Sign In screen.

2.  **Screen 1: Sign Up Credentials**
    *   **Display:**
        *   Header: "Create Account"
        *   Form fields with clear labels
    *   **Inputs:**
        *   Email Address (with email format validation)
        *   Password (with strength indicator)
            *   Requirements displayed: Min. 8 characters, mix of numbers/letters
        *   Confirm Password (with matching validation)
        *   Checkbox: "I agree to Terms & Privacy Policy" (with links)
    *   **Actions:**
        *   Primary: "Sign Up" button (disabled until form valid)
        *   Secondary: "Already have an account? Sign In" link
    *   **Validation:**
        *   Real-time field validation with inline error messages
        *   Email format check
        *   Password strength and match check
        *   Required field indicators
    *   **Error Handling:**
        *   Email already exists: "This email is already registered. Sign in instead?"
        *   Network error: "Connection issue. Please try again."
        *   Validation errors shown inline under each field

3.  **Screen 2: Create Profile**
    *   **Display:**
        *   Header: "Create Your Profile"
        *   Subheader: "Tell us who you are"
    *   **Inputs:**
        *   Username field (with availability check)
            *   Requirements: 3-30 chars, alphanumeric + underscores
        *   (Optional for MVP): Profile photo upload button
    *   **Actions:**
        *   Primary: "Complete Profile" button (disabled until valid)
        *   Secondary: "Skip for now" link (if photo upload is included)
    *   **Validation:**
        *   Username availability check (async)
        *   Format validation with inline feedback
    *   **Error Handling:**
        *   Username taken: "This username is already taken. Try another."
        *   Network error handling
    *   **Success Transition:**
        *   Brief success animation/message
        *   Redirect to Explore Tab (main app)

## 3. Sign In Flow

1.  **Trigger:** User taps "Sign In" from onboarding, Sign Up screen, or app launch after sign out.

2.  **Screen: Sign In**
    *   **Display:**
        *   Header: "Welcome Back"
        *   Form fields with clear labels
    *   **Inputs:**
        *   Email Address
        *   Password (with show/hide toggle)
        *   (Optional) "Remember me" checkbox
    *   **Actions:**
        *   Primary: "Sign In" button
        *   Secondary links:
            *   "Forgot Password?"
            *   "Don't have an account? Sign Up"
    *   **Validation:**
        *   Basic format validation before submission
    *   **Error Handling:**
        *   Invalid credentials: "Email or password incorrect. Please try again."
        *   Account not found: "No account found with this email. Sign up instead?"
        *   Too many attempts: "Too many failed attempts. Try again later or reset password."
        *   Network errors with retry option
    *   **Success Transition:**
        *   Brief loading indicator
        *   Redirect to Explore Tab (main app)

## 4. Forgot Password Flow

1.  **Trigger:** User taps "Forgot Password?" on Sign In screen.

2.  **Screen 1: Request Reset**
    *   **Display:**
        *   Header: "Reset Password"
        *   Instruction text explaining the process
    *   **Inputs:**
        *   Email Address field
    *   **Actions:**
        *   Primary: "Send Reset Link" button
        *   Secondary: "Back to Sign In" link
    *   **Validation:**
        *   Email format check
    *   **Error Handling:**
        *   Email not found: "If this email exists in our system, we'll send a reset link."
        *   Rate limiting: "You've requested too many resets. Please try again later."

3.  **Screen 2: Confirmation**
    *   **Display:**
        *   Success icon/animation
        *   Message: "Check your email"
        *   Instructions to check spam folder if not received
    *   **Actions:**
        *   Primary: "Back to Sign In" button
        *   Secondary: "Didn't receive email? Resend" (appears after 60 seconds)

4.  **Outside App Process:**
    *   User receives email with reset link
    *   User clicks link which opens in browser or deep links to app

5.  **Screen 3: Reset Password Form**
    *   **Display:**
        *   Header: "Create New Password"
        *   Form fields with clear labels
    *   **Inputs:**
        *   New Password (with strength indicator)
        *   Confirm New Password
    *   **Actions:**
        *   Primary: "Set New Password" button
    *   **Validation:**
        *   Password strength and matching checks
    *   **Success:**
        *   Confirmation message: "Password successfully reset"
        *   Redirect to Sign In with new credentials

## 5. Explore Tab Flow (Default View)

1.  **Screen: Main Explore Screen**
    *   **Display:**
        *   Header: "Explore" with optional search icon (future)
        *   Featured content carousel (optional)
        *   Section headers for each category with horizontal scrolling card lists
        *   Each card shows: Featured image, Title
        *   "See All >" link for each category
    *   **Initial State:**
        *   Loading state/skeleton UI while content loads
        *   Error state with retry if content fails to load
    *   **Actions:**
        *   Scroll vertically through categories
        *   Scroll horizontally through cards in each category
        *   Tap card to view article
        *   Tap "See All >" to view category detail

2.  **Screen: Category Detail Screen**
    *   **Display:**
        *   Header: Category name with back button
        *   Vertical scrolling list of all resources in category
        *   Each item shows: Image, Title, Brief description (optional)
    *   **Initial State:**
        *   Loading state/skeleton UI
        *   Empty state if no articles exist yet
    *   **Actions:**
        *   Tap resource card to view full article
        *   Back button to return to main Explore screen

3.  **Screen: Article Detail Screen**
    *   **Display:**
        *   Header: Article title with back button
        *   Hero image (optional)
        *   Article content in well-formatted text with headings, paragraphs, lists, etc.
        *   Additional images within content as needed
        *   Author/source attribution (optional)
    *   **Actions:**
        *   Scroll to read content
        *   (Future: "Save" or "Share" buttons)
        *   Back button to return to previous screen
    *   **States:**
        *   Loading state while content renders
        *   Error state if article fails to load

## 6. Social Feed Flow

1.  **Screen: Feed Screen**
    *   **Display:**
        *   Header: "Feed" with potential filter/sort options (future)
        *   Chronological list of post cards, newest first
        *   Each post card shows:
            *   User's username/avatar
            *   Timestamp (relative: "2h ago")
            *   Post text content
            *   Post image (if present)
            *   Like count with heart icon
            *   Comment count with comment icon
        *   Floating Action Button (+) for creating a new post
    *   **Initial States:**
        *   Loading state/skeleton UI while content loads
        *   "First Post" prompt if feed is empty
        *   Pull-to-refresh functionality
    *   **Actions:**
        *   Scroll to browse posts
        *   Tap like button to like/unlike (toggles state)
        *   Tap comment button or post body to view details and comments
        *   Tap FAB (+) to create new post
    *   **Error Handling:**
        *   Network error state with retry
        *   Graceful loading of images with placeholders

2.  **Screen: Post Detail Screen**
    *   **Display:**
        *   Header: "Post" with back button
        *   Original post content (same layout as in feed)
        *   Comment count
        *   Divider
        *   Comments section:
            *   List of comments (username, timestamp, text)
            *   Each comment in chronological order
        *   Comment input field with "Send" button (fixed at bottom)
    *   **Actions:**
        *   Scroll to view all comments
        *   Like the original post (same as in feed)
        *   Type in comment field and tap "Send" to post comment
        *   (Admin only: Menu option to delete post/comments)
    *   **States:**
        *   Loading state for comments
        *   Empty state if no comments ("Be the first to comment")
        *   Keyboard handling (shifts content up when comment field focused)
    *   **Error Handling:**
        *   Error posting comment with retry option
        *   Network disconnection handling during comment posting

3.  **Screen: Create Post Screen**
    *   **Display:**
        *   Header: "New Post" with close/cancel button
        *   Multi-line text input field with placeholder ("What's happening with your beardie?")
        *   "Add Photo" button with camera/gallery icon
        *   Photo preview area (shows selected image with remove option)
        *   Character counter (optional)
    *   **Actions:**
        *   Type in text field
        *   Tap "Add Photo" to open image picker
            *   Select from gallery or take new photo
        *   Remove selected image (if needed)
        *   "Post" button (becomes active when text or image added)
        *   "Cancel" to discard and return to feed
    *   **Validation:**
        *   Confirm before discarding if user tries to cancel with content entered
        *   Optional: character limit validation
    *   **States:**
        *   Image uploading indicator
        *   Post submission loading state
    *   **Error Handling:**
        *   Image upload failure with retry option
        *   Post submission failure with retry
        *   Image size/format validation

## 7. AI "Vet" Flow

1.  **Screen: Chat Screen**
    *   **Display:**
        *   Header: AI name (e.g., "Beardy Bot") with information icon
        *   Chat history area (scrollable)
            *   User messages: right-aligned, distinctive color
            *   AI responses: left-aligned, different color
            *   Timestamps (optional)
        *   Permanent disclaimer banner: "*AI advice is informational only. Consult a vet for medical concerns.*"
        *   Message input field with "Send" button (fixed at bottom)
    *   **Initial State:**
        *   First-time welcome message from AI including scope and disclaimer
        *   Loading previous conversation for returning users
        *   Empty state guidance if no history ("Ask me about bearded dragon care...")
    *   **Actions:**
        *   Type question in input field
        *   Tap "Send" button (or keyboard return) to submit
        *   Scroll to view conversation history
        *   (Optional) Tap info icon to view detailed AI capabilities/limitations
    *   **Interaction Flow:**
        *   User sends message -> Message appears in chat -> Loading indicator appears -> AI response appears
        *   Auto-scroll to show new messages
        *   Keyboard handling (shifts content when input focused)
    *   **Error States:**
        *   Network error during message sending with retry option
        *   AI service unavailable message with fallback suggestion
        *   Rate limiting indication if user sends too many messages rapidly

2.  **AI Information Modal (Optional):**
    *   **Trigger:** User taps information icon in header
    *   **Display:**
        *   Header: "About [AI Name]"
        *   Explanation of AI capabilities
        *   Clear limitations and disclaimer
        *   Examples of appropriate questions
    *   **Actions:**
        *   "Got it" or "Close" button to dismiss modal

## 8. Settings Flow

1.  **Screen: Main Settings Screen**
    *   **Display:**
        *   Header: "Settings"
        *   User section:
            *   Username display
            *   Email display
        *   Account section:
            *   "Change Password" option
            *   "Log Out" option
        *   Support section:
            *   "Help/FAQ" option
            *   "Contact Us" option
            *   "Send Feedback" option
        *   Legal section:
            *   "Terms of Service" option
            *   "Privacy Policy" option
        *   App section:
            *   Version number display
            *   (Future: Delete account option)
    *   **Actions:**
        *   Tap any option to navigate to corresponding screen
        *   "Log Out" presents confirmation dialog
    *   **States:**
        *   Loading state if account data is being fetched

2.  **Log Out Confirmation Dialog:**
    *   **Trigger:** Tap "Log Out" in Settings
    *   **Display:**
        *   Title: "Log Out"
        *   Message: "Are you sure you want to log out of Beardy?"
        *   Buttons: "Cancel" and "Log Out"
    *   **Actions:**
        *   "Cancel" dismisses dialog
        *   "Log Out" clears credentials, ends session, navigates to Sign In screen

3.  **Screen: Change Password**
    *   **Display:**
        *   Header: "Change Password" with back button
        *   Form fields:
            *   Current Password
            *   New Password (with strength indicator)
            *   Confirm New Password
        *   Validation guidance (password requirements)
    *   **Actions:**
        *   Fill form fields
        *   "Update Password" button (disabled until form valid)
        *   Back button to return to Settings
    *   **Validation:**
        *   Current password verification
        *   New password strength check
        *   Passwords match confirmation
    *   **States:**
        *   Loading during verification/update
        *   Success confirmation
    *   **Error Handling:**
        *   Incorrect current password
        *   Network errors
        *   Validation errors

4.  **Screen: Help/FAQ (and other linked resources)**
    *   **Display:**
        *   Header: Content title with back button
        *   Content relevant to the selection (Help, Terms, Privacy, etc.)
    *   **Actions:**
        *   Scroll to read content
        *   Back button to return to Settings

## 9. Error and Edge Case Handling

1.  **Network Connectivity Issues:**
    *   **Offline Banner:** Appears when connection lost
    *   **Retry Mechanisms:** For failed data fetches
    *   **Queued Actions:** Post/comment creation while offline

2.  **Empty States:**
    *   **Empty Feed:** Guidance on creating first post or following users
    *   **No Search Results:** Helpful messaging
    *   **No Comments:** Prompt to add first comment

3.  **Session Expiration:**
    *   **Silent Token Refresh:** When possible
    *   **Re-authentication Prompt:** When token refresh fails
    *   **Data Preservation:** Save draft content before redirecting to login

4.  **First Launch Experience:**
    *   **Content Pre-loading:** Initial resources loaded for new users
    *   **Guided Hints:** Optional tooltips explaining key features 