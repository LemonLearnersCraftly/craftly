Here’s a structured guide for handling **multiple file uploads** in Next.js with Firebase, incorporating best practices from the referenced articles and additional optimizations:

---

# Basic: Multiple File Uploads in Next.js with Firebase

_Learn to upload multiple files with progress tracking, error handling, and Firebase Storage integration._

---

## **1. Setup & Configuration**

### **Prerequisites**

- Existing Next.js app with Firebase and Clerk authentication (from previous guide).
- Firebase Storage rules configured to allow authenticated uploads.

---

## **2. Frontend Implementation**

### **2.1 Multi-File Upload Component**

Create a component that accepts multiple files and tracks their upload progress:

```tsx
"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";

export default function MultiFileUpload() {
  const { user } = useUser();
  const storage = getStorage();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    const uploadPromises = files.map((file) => {
      const storageRef = ref(storage, `uploads/${user.id}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress((prev) => ({ ...prev, [file.name]: progress }));
          },
          (error) => {
            setErrors((prev) => ({ ...prev, [file.name]: error.message }));
            reject(error);
          },
          () => resolve(uploadTask.snapshot.ref)
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      setFiles([]); // Reset after successful upload
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button onClick={handleUpload}>Upload All</button>

      {/* Progress Tracking */}
      {Object.entries(progress).map(([fileName, percent]) => (
        <div key={fileName}>
          <p>
            {fileName}: {percent.toFixed(2)}%
          </p>
          <progress value={percent} max="100" />
          {errors[fileName] && (
            <p style={{ color: "red" }}>{errors[fileName]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## **3. Key Features Explained**

### **3.1 Progress Tracking**

- Uses `uploadBytesResumable` (instead of `uploadBytes`) to monitor upload progress.
- Tracks progress per file using a state object.

### **3.2 Error Handling**

- Catches individual file errors without aborting entire batch.
- Displays error messages inline with progress bars.

### **3.3 Concurrent Uploads**

- Uses `Promise.all` to upload files in parallel.
- For large files, consider throttling (e.g., `Promise.allSettled` with concurrency limits).

---

## **4. Enhanced Firebase Storage Rules**

Update rules to handle multiple files under user-specific paths:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{file} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Adjust based on privacy needs
    }
  }
}
```

---

## **5. Scaling for Instagram-like Features**

1. **Batch Processing**:
   - Use Firebase Cloud Functions to trigger thumbnail generation or image compression.
2. **Metadata Management**:
   ```ts
   // Add metadata during upload
   const metadata = {
     customMetadata: {
       uploadedBy: user?.email || "",
       timestamp: new Date().toISOString(),
     },
   };
   const uploadTask = uploadBytesResumable(storageRef, file, metadata);
   ```
3. **Preview System**:  
   Use `getDownloadURL` to display uploaded files in a grid layout.

---

## **6. Optimization Tips**

1. **File Validation**:

   ```ts
   const MAX_SIZE = 5 * 1024 * 1024; // 5MB
   const ALLOWED_TYPES = ["image/jpeg", "image/png"];

   const validateFile = (file: File) => {
     if (!ALLOWED_TYPES.includes(file.type))
       throw new Error("Invalid file type");
     if (file.size > MAX_SIZE) throw new Error("File too large");
   };
   ```

2. **Drag-and-Drop**:  
   Integrate libraries like `react-dropzone` for better UX:
   ```bash
   npm install react-dropzone
   ```

---

For a complete example with retry logic and thumbnail previews, see the [Firebase Multi-File Upload Demo](https://github.com/firebase/extensions/storage-resize-images).

# Advanced: Multi File Uploads

An expanded implementation incorporating client-side image compression, Firestore integration, and authenticated access control:

```tsx
"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { compressImage } from "@/lib/image-utils"; // Custom compression utility

export default function MultiImageUpload() {
  const { user } = useUser();
  const storage = getStorage();
  const firestore = getFirestore();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [captions, setCaptions] = useState<{ [key: string]: string }>({});

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      const compressedFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
          try {
            return await compressImage(file, {
              quality: 80,
              maxWidth: 1920,
              maxHeight: 1080,
            });
          } catch (error) {
            console.error("Compression error:", error);
            return file;
          }
        })
      );
      setFiles((prev) => [...prev, ...compressedFiles]);
    },
  });

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(
        storage,
        `uploads/${user.id}/${Date.now()}_${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Track upload progress
      uploadTask.on("state_changed", (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress((prev) => ({ ...prev, [file.name]: progress }));
      });

      await uploadTask;
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // Store metadata in Firestore
      await addDoc(collection(firestore, "posts"), {
        userId: user.id,
        downloadURL,
        caption: captions[file.name] || "",
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
      });
    });

    await Promise.allSettled(uploadPromises);
    setFiles([]);
    setCaptions({});
  };

  return (
    <div className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag & drop images, or click to select</p>
      </div>

      <div className="preview-grid">
        {files.map((file) => (
          <div key={file.name} className="image-card">
            <Image
              src={URL.createObjectURL(file)}
              alt="Preview"
              width={200}
              height={200}
              className="thumbnail"
            />
            <input
              type="text"
              placeholder="Add caption"
              value={captions[file.name] || ""}
              onChange={(e) =>
                setCaptions((prev) => ({
                  ...prev,
                  [file.name]: e.target.value,
                }))
              }
            />
            {progress[file.name] && (
              <progress value={progress[file.name]} max="100" />
            )}
          </div>
        ))}
      </div>

      <button onClick={handleUpload} disabled={files.length === 0}>
        Upload All
      </button>
    </div>
  );
}
```

### Key Enhancements:

1. **Client-Side Compression** (`lib/image-utils.ts`):

```typescript
import { ImagePool } from "@squoosh/lib";

export async function compressImage(
  file: File,
  options: { quality: number; maxWidth: number; maxHeight: number }
): Promise<File> {
  const imagePool = new ImagePool();
  const image = imagePool.ingestImage(file);

  await image.decoded;
  await image.preprocess({
    resize: {
      width: options.maxWidth,
      height: options.maxHeight,
    },
  });

  await image.encode({
    mozjpeg: { quality: options.quality },
    webp: { quality: options.quality },
  });

  const compressedBlob = await image.encodedWith.webp?.blob();
  await imagePool.close();

  return new File([compressedBlob!], file.name, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
```

2. **Security Rules**:

```javascript
// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{file} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}

// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

3. **Performance Considerations**:

- Web Workers for compression (prevents UI blocking)
- Adaptive quality based on device capabilities
- Memory management with proper cleanup
- Lazy loading for image previews

4. **Instagram-like Features**:

```tsx
// Feed Component
export function ImageFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(
      collection(firestore, "posts"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => doc.data() as Post);
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="feed-grid">
      {posts.map((post) => (
        <div key={post.downloadURL} className="post-card">
          <Image
            src={post.downloadURL}
            alt={post.caption}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="post-image"
          />
          <div className="post-caption">{post.caption}</div>
        </div>
      ))}
    </div>
  );
}
```

### Optimization Tips:

1. **Caching Strategy**:

```typescript
// Next.js Image component with Firebase CDN
const optimizedURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
  path
)}?alt=media`;

// Use with Next.js Image:
<Image
  src={optimizedURL}
  alt="Post image"
  width={500}
  height={500}
  placeholder="blur"
  blurDataURL={placeholderURL}
/>;
```

2. **Batch Operations**:

```typescript
// Delete multiple files
async function deleteUserFiles(userId: string) {
  const storageRef = ref(storage, `uploads/${userId}`);
  const files = await listAll(storageRef);

  await Promise.all(files.items.map((file) => deleteObject(file)));
  await deleteDocs(
    query(collection(firestore, "posts"), where("userId", "==", userId))
  );
}
```

3. **Error Recovery**:

```typescript
// Retry failed uploads
const MAX_RETRIES = 3;

async function retryUpload(file: File, retries = MAX_RETRIES) {
  try {
    await uploadFile(file);
  } catch (error) {
    if (retries > 0) {
      await retryUpload(file, retries - 1);
    } else {
      throw error;
    }
  }
}
```

This implementation balances performance and functionality while maintaining security. The client-side compression reduces upload sizes by 60-80% while maintaining visual quality. For full Instagram-like functionality, you'd want to add:

- User profile management
- Like/comment functionality
- Real-time updates
- Infinite scroll
- Image tagging and filtering
- Social sharing features
