# Beardy App - Data Structures (Supabase MVP)

This document outlines the proposed Supabase database tables for the Beardy MVP, including table relationships, indices, and optimizations.

## Database Design Overview

The Beardy app uses a relational database model implemented in PostgreSQL through Supabase. The design prioritizes:

- **Data integrity** through foreign key relationships
- **Query performance** through strategic indexing
- **Security** through Row Level Security (RLS) policies
- **Scalability** through normalized structure

**Note:** Row Level Security (RLS) must be enabled and configured appropriately for all tables to enforce proper access control.

## Table Schemas

### 1. `profiles`

Stores public user data linked to authentication. This table extends the built-in `auth.users` table.

*   **Columns:**
    *   `id` (UUID, PK, FK -> auth.users.id)
    *   `username` (TEXT, Unique, Not Null)
    *   `created_at` (TimestampTZ, default `now()`)
    *   `updated_at` (TimestampTZ, default `now()`)
*   **Relationships:**
    *   One-to-one with `auth.users` via `id` (Foreign Key)
    *   One-to-many with `posts`, `comments`, `likes`, and `chat_history`
*   **Indices:**
    *   Primary Key `id`
    *   Unique index on `username` (for username lookup/validation)
*   **RLS Policies:**
    *   **Read:** Allow all authenticated users
    *   **Insert:** Function/trigger-based during sign-up flow
    *   **Update:** Only owner (`auth.uid() = id`)
    *   **Delete:** Restricted (to maintain data integrity)

### 2. `posts`

Stores social feed posts created by users.

*   **Columns:**
    *   `id` (UUID, PK, default `gen_random_uuid()`)
    *   `user_id` (UUID, FK -> profiles.id, Not Null)
    *   `content` (TEXT, Nullable) - Allow posts with only images
    *   `image_url` (TEXT, Nullable) - Link to Supabase Storage
    *   `created_at` (TimestampTZ, default `now()`)
    *   `updated_at` (TimestampTZ, default `now()`)
*   **Relationships:**
    *   Many-to-one with `profiles` via `user_id`
    *   One-to-many with `comments` and `likes`
*   **Constraints:**
    *   Check constraint: At least one of `content` or `image_url` must be non-null
*   **Indices:**
    *   Primary Key `id`
    *   Index on `user_id` (for user's posts retrieval)
    *   Index on `created_at` (for chronological sorting)
*   **RLS Policies:**
    *   **Read:** Allow all authenticated users
    *   **Insert:** Only self (`auth.uid() = user_id`)
    *   **Update:** Only self (`auth.uid() = user_id`)
    *   **Delete:** Only self or admin role

### 3. `comments`

Stores comments made on posts.

*   **Columns:**
    *   `id` (UUID, PK, default `gen_random_uuid()`)
    *   `post_id` (UUID, FK -> posts.id, Not Null)
    *   `user_id` (UUID, FK -> profiles.id, Not Null)
    *   `content` (TEXT, Not Null)
    *   `created_at` (TimestampTZ, default `now()`)
*   **Relationships:**
    *   Many-to-one with `posts` via `post_id`
    *   Many-to-one with `profiles` via `user_id`
*   **Indices:**
    *   Primary Key `id`
    *   Index on `post_id` (for comments retrieval per post)
    *   Index on `user_id` (for user's comments retrieval)
    *   Composite index on (`post_id`, `created_at`) for ordered comments retrieval
*   **RLS Policies:**
    *   **Read:** Allow all authenticated users
    *   **Insert:** Only self (`auth.uid() = user_id`)
    *   **Update:** Only self (`auth.uid() = user_id`)
    *   **Delete:** Only self or admin role

### 4. `likes`

Tracks likes on posts using a junction table pattern.

*   **Columns:**
    *   `id` (BigSerial, PK)
    *   `post_id` (UUID, FK -> posts.id, Not Null)
    *   `user_id` (UUID, FK -> profiles.id, Not Null)
    *   `created_at` (TimestampTZ, default `now()`)
*   **Relationships:**
    *   Many-to-one with `posts` via `post_id`
    *   Many-to-one with `profiles` via `user_id`
*   **Constraints:**
    *   Unique constraint on (`post_id`, `user_id`) to prevent duplicate likes
*   **Indices:**
    *   Primary Key `id`
    *   Unique index on (`post_id`, `user_id`) enforcing constraint
    *   Index on `post_id` for like count queries
*   **RLS Policies:**
    *   **Read:** Allow all authenticated users
    *   **Insert:** Only self (`auth.uid() = user_id`)
    *   **Delete:** Only self (`auth.uid() = user_id`)

### 5. `resource_categories`

Defines categories for the Explore tab's curated content.

*   **Columns:**
    *   `id` (UUID, PK, default `gen_random_uuid()`)
    *   `name` (TEXT, Unique, Not Null)
    *   `description` (TEXT, Nullable)
    *   `display_order` (INTEGER, Not Null, default 0) - For controlling category display order
    *   `created_at` (TimestampTZ, default `now()`)
    *   `updated_at` (TimestampTZ, default `now()`)
*   **Relationships:**
    *   One-to-many with `resources`
*   **Indices:**
    *   Primary Key `id`
    *   Unique index on `name`
    *   Index on `display_order` for ordered retrieval
*   **RLS Policies:**
    *   **Read:** Allow all authenticated users
    *   **Insert/Update/Delete:** Admin role only

### 6. `resources`

Stores curated articles/guides for the Explore tab.

*   **Columns:**
    *   `id` (UUID, PK, default `gen_random_uuid()`)
    *   `category_id` (UUID, FK -> resource_categories.id, Not Null)
    *   `title` (TEXT, Not Null)
    *   `content` (TEXT, Not Null) - Store as Markdown/text
    *   `summary` (TEXT, Nullable) - Short description for listings
    *   `featured_image_url` (TEXT, Nullable) - Link to Supabase Storage
    *   `display_order` (INTEGER, Not Null, default 0) - For controlling display order within category
    *   `created_at` (TimestampTZ, default `now()`)
    *   `updated_at` (TimestampTZ, default `now()`)
*   **Relationships:**
    *   Many-to-one with `resource_categories` via `category_id`
*   **Indices:**
    *   Primary Key `id`
    *   Index on `category_id` for category-based retrieval
    *   Composite index on (`category_id`, `display_order`) for ordered retrieval within category
*   **RLS Policies:**
    *   **Read:** Allow all authenticated users
    *   **Insert/Update/Delete:** Admin role only

### 7. `chat_history`

Stores AI Vet conversation history per user.

*   **Columns:**
    *   `id` (UUID, PK, default `gen_random_uuid()`)
    *   `user_id` (UUID, FK -> profiles.id, Not Null)
    *   `message_content` (TEXT, Not Null)
    *   `sender` (TEXT, Not Null, CHECK `sender IN ('USER', 'AI')`)
    *   `timestamp` (TimestampTZ, default `now()`)
    *   `conversation_id` (UUID, Not Null) - Groups messages in the same conversation
*   **Relationships:**
    *   Many-to-one with `profiles` via `user_id`
*   **Indices:**
    *   Primary Key `id`
    *   Index on `user_id` for user-specific retrieval
    *   Composite index on (`user_id`, `conversation_id`, `timestamp`) for ordered conversation retrieval
*   **RLS Policies:**
    *   **Read:** Only owner (`auth.uid() = user_id`)
    *   **Insert:** Only owner for their own conversations
    *   **Delete:** Only owner for their own conversations

## Supabase Storage Buckets

### 1. `post-images`
*   **Purpose:** Store user-uploaded images for posts
*   **Access Control:**
    *   **Read:** Authenticated users (public to app users)
    *   **Write:** Owner only (upload restricted to auth.uid)
*   **Configuration:**
    *   Set appropriate file size limits
    *   Configure allowed MIME types (image/jpeg, image/png, etc.)
    *   Consider enabling image transformations (resizing)

### 2. `resource-images`
*   **Purpose:** Store images for curated resource articles
*   **Access Control:**
    *   **Read:** Public (authenticated users)
    *   **Write:** Admin role only
*   **Configuration:**
    *   Higher quality storage for professional content
    *   Content-disposition settings for web display

## Database Function Examples

### 1. Post Like Count Function
```sql
CREATE OR REPLACE FUNCTION get_post_like_count(post_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM likes WHERE post_id = $1;
$$ LANGUAGE SQL SECURITY DEFINER;
```

### 2. User Post Interaction Status
```sql
CREATE OR REPLACE FUNCTION user_has_liked_post(post_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM likes 
    WHERE post_id = $1 AND user_id = $2
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

## Migration and Deployment Considerations

1. **Initialization:**
   * Create tables in proper dependency order (profiles before posts, etc.)
   * Configure RLS policies immediately after table creation
   * Pre-populate resource_categories with initial categories

2. **Indices:**
   * Create indices after initial data load for better performance
   * Monitor query performance and add/adjust indices as needed

3. **Relations:**
   * Ensure proper ON DELETE actions for referential integrity
   * Consider using Foreign Key constraints with CASCADE for some relations

4. **Security:**
   * Validate RLS policies thoroughly before deployment
   * Consider using service roles for admin functions 