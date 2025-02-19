# Comprehensive Guide - Authenticated File Uploads in Next.js with Firebase & Clerk

_This guide walks through integrating Clerk for authentication, Firebase for storage, and Next.js for building a secure file upload system. It also explores scaling to an Instagram-like app and compares Firebase with AWS S3. Created using some personal exploration, GPT-3o, and Deepseek R1._

This document describes ways to store images in firebase.
I have implemented a basic version.

1. `/src/app/page.js`: contains a sample implementation of a React component that handles file upload and then shows those uploaded files to the user
2. `/src/libs`: contains the helper functions we can actually use for uploading and retrieving files
3. `/utils/firebaseConfig.js`: contains updated config to handle storage functionality

> [!CAUTION]
> Currently the implementation works with unauthenticated users.

---

## **1. Setting Up Authentication with Clerk & Firebase**

### **1.1 Prerequisites**

- A Next.js project (App Router recommended).
- Firebase project with **Cloud Storage** and **Authentication** enabled.
- Clerk account and application.

### **1.2 Configure Clerk**

1. **Install Clerk SDK**:
   ```bash
   npm install @clerk/nextjs
   ```
2. **Set Environment Variables**:  
   Add Clerk keys to `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```
3. **Wrap Your App in `<ClerkProvider>`**:  
   Update `app/layout.tsx` to include Clerk’s context provider:

   ```tsx
   import { ClerkProvider } from "@clerk/nextjs";

   export default function RootLayout({ children }) {
     return <ClerkProvider>{children}</ClerkProvider>;
   }
   ```

4. **Add Clerk Middleware**:  
   Create `middleware.ts` to protect routes (e.g., only allow authenticated users to access `/upload`):

   ```ts
   import { clerkMiddleware } from "@clerk/nextjs/server";

   export default clerkMiddleware();

   export const config = { matcher: ["/upload"] };
   ```

### **1.3 Integrate Firebase Auth with Clerk**

1. **Generate Firebase JWT in Clerk**:
   - In the Clerk Dashboard, enable the **Firebase integration** and upload your Firebase service account key .
   - Configure a JWT template in Clerk to include Firebase claims (e.g., `uid`).
2. **Initialize Firebase in Next.js**:  
   Create a `lib/firebase.ts` file to initialize Firebase with Clerk’s JWT:

   ```ts
   import { initializeApp, getApps } from "firebase/app";
   import { getAuth, signInWithCustomToken } from "firebase/auth";

   const firebaseConfig = {
     /* Your Firebase config */
   };

   export const firebaseApp = getApps()[0] || initializeApp(firebaseConfig);
   export const auth = getAuth(firebaseApp);

   // Use Clerk's JWT to authenticate Firebase
   export async function getFirebaseToken(clerkToken: string) {
     const response = await fetch("/api/get-firebase-token", {
       headers: { Authorization: `Bearer ${clerkToken}` },
     });
     return response.json();
   }
   ```

---

## **2. File Uploads for Authenticated Users**

### **2.1 Frontend Upload Component**

1. **Create an Upload Form**:

   ```tsx
   "use client";
   import { useUser } from "@clerk/nextjs";
   import { getStorage, ref, uploadBytes } from "firebase/storage";

   export default function UploadForm() {
     const { user } = useUser();
     const storage = getStorage(firebaseApp);

     const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file || !user) return;

       const storageRef = ref(storage, `uploads/${user.id}/${file.name}`);
       await uploadBytes(storageRef, file);
     };

     return <input type="file" onChange={handleUpload} />;
   }
   ```

### **2.2 Secure Firebase Storage Rules**

Add Security Rules in Firebase to restrict access:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{file} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## **3. Viewing Files (Authenticated-Only)**

1. **Fetch Files from Firebase**:

   ```tsx
   import { listAll } from "firebase/storage";

   const fetchFiles = async (userId: string) => {
     const storageRef = ref(storage, `uploads/${userId}`);
     const files = await listAll(storageRef);
     return files.items.map((item) => item.name);
   };
   ```

2. **Display Files Conditionally**:  
   Use Clerk’s `<SignedIn>` and `<SignedOut>` components to control UI visibility.

---

## **4. Scaling to an Instagram-like App**

- **User Profiles**: Extend Clerk’s user metadata to include profile pictures and bios.
- **Feed System**: Use Firestore to store posts linking to Firebase Storage URLs.
- **Social Features**: Implement likes/comments using Firestore real-time updates.
- **Optimization**: Use Firebase’s CDN for faster image delivery.

---

## **5. Firebase vs. AWS S3**

| **Feature**        | **Firebase Storage**                        | **AWS S3**                         |
| ------------------ | ------------------------------------------- | ---------------------------------- |
| **Authentication** | Built-in with Firebase Auth                 | Requires Cognito/IAM policies      |
| **Scalability**    | Automatic scaling with Google Cloud         | Manual configuration needed        |
| **Pricing**        | Pay-as-you-go (includes CDN costs)          | Lower storage costs, higher egress |
| **Integration**    | Tightly integrated with Firestore/Functions | Works with Lambda, RDS, etc.       |
| **Ease of Use**    | Beginner-friendly with SDKs                 | Steeper learning curve             |

For a complete code example, refer to the [Clerk + Firebase Next.js Demo](https://github.com/clerk/clerk-firebase-nextjs) .

---

## **6. Additional Stuff**

## Enhanced Security Rules

**File Type & Size Restrictions (Images Only)**

```
service firebase.storage {
  match /b/{bucket}/o {
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }

    function underSizeLimit() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }

    match /uploads/{userId}/{fileId} {
      allow write: if request.auth != null
        && request.auth.uid == userId
        && isImage()
        && underSizeLimit();

      allow read: if request.auth != null;
    }
  }
}
```

_Supports: JPEG, PNG, WEBP, TIFF_

## Draft Management System

**Firestore Document Structure for Version Control**

```
{
  "drafts": {
    "draft_01": {
      "filePath": "uploads/user123/draft_image.jpg",
      "createdAt": "2025-02-05T04:00:00Z",
      "isActive": true,
      "version": 2
    }
  }
}
```

Implementation strategy:

1. Store draft metadata in Firestore
2. Use Cloud Functions to manage file versions
3. Implement soft deletion with TTL policies

## Quota Management (Blaze Plan Optimized)

```
function checkQuota(userId) {
  let userDoc = get(/databases/$(database)/documents/users/$(userId));
  return userDoc.data.storageUsed + request.resource.size < 150 * 1024 * 1024; // 150MB/user
}
```

Add to security rules:

```
allow write: if checkQuota(userId);
```

_Automated cleanup process:_

1. Daily Cloud Function to audit storage
2. Email notifications at 80% capacity
3. Automatic TTL enforcement for temp files

## CDN Configuration Guide

**Google Cloud CDN Integration**

1. Enable Cloud CDN in Google Cloud Console
2. Create load balancer pointing to Storage bucket
3. Set cache policies:

```
{
  "cacheMode": "CACHE_ALL_STATIC",
  "defaultTtl": "86400s", // 24hrs
  "maxTtl": "604800s" // 7 days
}
```

Alternative options:

- Cloudflare Workers (free tier available)
- Firebase Hosting proxy

## Instagram Feature Extensions

| Feature        | Implementation Stack               |
| -------------- | ---------------------------------- |
| Stories        | Firebase Storage + Cloud Functions |
| Feed Algorithm | Firestore + Algolia Integration    |
| Image Filters  | Cloud Run + WASM Modules           |
| Comments       | Firestore Subcollections           |
| Hashtags       | Firestore Full-Text Search         |

## Firebase vs AWS S3: Feature Matrix

| Criteria         | Firebase Storage             | AWS S3                        |
| ---------------- | ---------------------------- | ----------------------------- |
| Auth Integration | Native Firebase Auth         | IAM Policies/Cognito          |
| CDN Setup        | 1-Click via GCP              | Manual CloudFront Config      |
| Pricing Model    | Pay-as-you-go + Free Tier    | Volume Discounts Available    |
| File Processing  | Extensions + Cloud Functions | Lambda@Edge                   |
| Monitoring       | Firebase Console Integrated  | CloudWatch Required           |
| Best Use Case    | Rapid MVP Development        | Enterprise Scale Applications |

**Cost Optimization Tips:**

1. Enable Object Lifecycle Management
2. Use Regional storage for frequent access
3. Compress images during upload
4. Implement cache-control headers

## Maintenance & Monitoring

1. Set up Cloud Monitoring alerts for:
   - Storage bucket size
   - API request rates
   - CDN cache hit ratios
2. Monthly cost forecasting using Firebase Usage Dashboard
3. Automated backup system using Cloud Scheduler
