This document describes ways to store images in firebase.

I have implemented a basic version.

1. `/src/app/page.js`: contains implementation of a React component that handles file upload and then shows those uploaded files to the user
2. `/src/libs`: contains the helper functions we can actually use for uploading and retrieving files

> [!NOTE] Currently the implementation works with unauthenticated users.

# Secure File Uploads in Next.js with Firebase & Clerk

## Architecture Overview

1. **Clerk**: Handle user authentication and session management
2. **Firebase**:
   - Authentication (via Clerk integration)
   - Storage for file uploads
   - Security rules for access control
3. **Next.js**: Frontend UI and API routes

## Setup Requirements

- Firebase Project ([console.firebase.google.com](https://console.firebase.google.com/))
- Clerk Application ([dashboard.clerk.com](https://dashboard.clerk.com/))
- Next.js 14+ Project

---

## 1. Authentication Setup

### Clerk Configuration

`yarn add @clerk/nextjs`

Or use `npm install`

# .env.local

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```

### Firebase-Clerk Integration

```js
// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

```js
// middleware.js
import { authMiddleware } from "@clerk/nextjs";
export default authMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

## 2. Secure File Uploads

### Firebase Storage Rules

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{fileId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Upload Component

```js
import { useUser } from "@clerk/nextjs";
import { getStorage, ref, uploadBytes } from "firebase/storage";

export default function Uploader() {
  const { user } = useUser();
  const storage = getStorage();

  const handleUpload = async (file) => {
    const storageRef = ref(storage, `uploads/${user.id}/${file.name}`);
    await uploadBytes(storageRef, file);
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files)} />;
}
```

## 3. File Access Control

### Protected API Route

```js
// pages/api/files.js
import { getStorage, ref, listAll } from "firebase/storage";
import { getAuth } from "firebase/auth";

export default async function handler(req, res) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const storage = getStorage();
  const listRef = ref(storage, `uploads/${user.uid}`);
  const files = await listAll(listRef);

  res.status(200).json(files.items);
}
```

## Instagram-like Feature Extrapolation

| Feature        | Implementation Strategy                    |
| -------------- | ------------------------------------------ |
| User Profiles  | Clerk user metadata + Firestore documents  |
| Image Feed     | Firestore collection with post metadata    |
| Follow System  | Firestore subcollections for relationships |
| Comments/Likes | Real-time Firestore listeners              |
| Stories        | Firebase Storage with expiration metadata  |

---

## Firebase vs AWS S3 Comparison

| Feature               | Firebase Storage         | AWS S3                  |
| --------------------- | ------------------------ | ----------------------- |
| Authentication        | Integrated with Firebase | IAM Policies            |
| Security Rules        | Declarative JSON         | Bucket Policies         |
| Pricing (US Standard) | $0.026/GB/month          | $0.023/GB/month         |
| CDN Integration       | Built-in                 | Requires CloudFront     |
| Scalability           | Automatic scaling        | Manual configuration    |
| File Size Limit       | 5TB                      | 5TB                     |
| Best For              | Mobile/Web apps          | Enterprise applications |

---

## Implementation Notes

1. **Security**: Always validate file types and sizes in both client and server
2. **Optimization**: Use Firebase Extensions for image resizing
3. **Monitoring**: Set up Firebase Analytics for upload tracking
4. **Backups**: Implement Cloud Storage lifecycle policies

For production applications, consider combining Firebase Storage with Cloud Functions for advanced processing like:

- Image compression
- Content moderation
- Thumbnail generation
- Metadata extraction

**Clarifying Questions Needed:**

1. Should we implement role-based access control beyond basic authentication?
2. Are there specific file type restrictions needed (e.g., images only)?
3. Do you require version control for uploaded files?
4. Should we implement quota limits per user?
5. Need content delivery network (CDN) configuration details?
