"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";

import {
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [booksRead] = useState(10);
  const [currentlyReading] = useState(0);
  const [wishlist] = useState(3);

  const [publicProfile, setPublicProfile] = useState(false);
  const [notifications, setNotifications] = useState(true);

  /* ------------------------------- */
  /* Load user data */
  /* ------------------------------- */

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) return;

      setUser(u);

      setName(u.displayName || "");
      setPhoto(u.photoURL || "");

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {

        const data = snap.data();

        if (data.name) setName(data.name);
        if (data.photo) setPhoto(data.photo);

      }

    });

    return () => unsub();

  }, []);

  /* ------------------------------- */
  /* Select avatar image */
  /* ------------------------------- */

  const uploadAvatar = (e: any) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      const base64 = reader.result as string;

      setPhoto(base64);

    };

    reader.readAsDataURL(file);

  };

  /* ------------------------------- */
  /* Save profile */
  /* ------------------------------- */

  const saveProfile = async () => {

    if (!user) return;

    setLoading(true);

    let photoURL = photo;

    /* If new base64 image selected → upload */

    if (photo && photo.startsWith("data:image")) {

      const response = await fetch(photo);
      const blob = await response.blob();

      const storageRef = ref(storage, `avatars/${user.uid}`);

      await uploadBytes(storageRef, blob);

      photoURL = await getDownloadURL(storageRef);

    }

    /* Update Firebase Auth */

    await updateProfile(user, {
      displayName: name,
      photoURL: photoURL
    });

    /* Update Firestore */

    await setDoc(
      doc(db, "users", user.uid),
      {
        name: name,
        photo: photoURL
      },
      { merge: true }
    );

    setPhoto(photoURL);

    setEditing(false);
    setLoading(false);

  };

  if (!user) return null;

  return (
    <div className="space-y-8">

      {/* Title */}

      <h2 className="text-2xl font-semibold">
        My Profile
      </h2>

      {/* Profile Card */}

      <div className="bg-[#17172B] rounded-2xl p-6 flex items-center gap-6">

        {/* Avatar */}

        <div className="relative">

          {photo && photo.startsWith("http") ? (

            <img
              src={photo}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border border-white/10"
              onError={(e:any)=>{
                e.currentTarget.style.display="none";
              }}
            />

          ) : (

            <div className="w-20 h-20 rounded-full bg-[#C9A84C] flex items-center justify-center text-black font-bold text-xl">
              {name?.[0] || "U"}
            </div>

          )}

          {editing && (

            <label className="absolute bottom-0 right-0 bg-[#C9A84C] text-black text-xs px-2 py-1 rounded cursor-pointer">

              Edit

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadAvatar}
              />

            </label>

          )}

        </div>

        {/* Info */}

        <div className="flex-1">

          {editing ? (

            <input
              value={name}
              onChange={(e)=>setName(e.target.value)}
              className="bg-black border border-white/10 rounded px-3 py-2 w-full"
            />

          ) : (

            <h3 className="text-lg font-semibold">
              {name}
            </h3>

          )}

          <p className="text-gray-400 text-sm">
            {user.email}
          </p>

          {/* Buttons */}

          {editing ? (

            <div className="mt-3 flex gap-4">

              <button
                onClick={saveProfile}
                className="bg-[#C9A84C] text-black px-4 py-2 rounded"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={()=>setEditing(false)}
                className="text-gray-400"
              >
                Cancel
              </button>

            </div>

          ) : (

            <button
              onClick={()=>setEditing(true)}
              className="mt-3 bg-[#C9A84C] text-black px-4 py-2 rounded"
            >
              Edit Profile
            </button>

          )}

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-4">

        <div className="bg-[#17172B] rounded-xl p-6 text-center">

          <p className="text-2xl font-bold">
            {booksRead}
          </p>

          <p className="text-gray-400 text-sm">
            Books Read
          </p>

        </div>

        <div className="bg-[#17172B] rounded-xl p-6 text-center">

          <p className="text-2xl font-bold">
            {currentlyReading}
          </p>

          <p className="text-gray-400 text-sm">
            Currently Reading
          </p>

        </div>

        <div className="bg-[#17172B] rounded-xl p-6 text-center">

          <p className="text-2xl font-bold">
            {wishlist}
          </p>

          <p className="text-gray-400 text-sm">
            Wishlist
          </p>

        </div>

      </div>

      {/* Settings */}

      <div className="bg-[#17172B] rounded-2xl p-6 space-y-6">

        <h3 className="text-lg font-semibold">
          Settings
        </h3>

        <div className="flex justify-between items-center">

          <div>

            <p className="font-medium">
              Public Profile
            </p>

            <p className="text-sm text-gray-400">
              Allow others to view your reading list
            </p>

          </div>

          <input
            type="checkbox"
            checked={publicProfile}
            onChange={()=>setPublicProfile(!publicProfile)}
          />

        </div>

        <div className="flex justify-between items-center">

          <div>

            <p className="font-medium">
              Notifications
            </p>

            <p className="text-sm text-gray-400">
              Get AI suggestions & updates
            </p>

          </div>

          <input
            type="checkbox"
            checked={notifications}
            onChange={()=>setNotifications(!notifications)}
          />

        </div>

      </div>

      {/* Sign out */}

      <button
        onClick={()=>auth.signOut()}
        className="w-full border border-red-500 text-red-500 py-3 rounded-full"
      >
        Sign Out
      </button>

    </div>
  );
}