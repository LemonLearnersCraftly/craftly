'use client'
import { useUser } from '@clerk/nextjs';
import { useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import Card from './PreferencesItemCard';
import { db } from '../utils/firebaseConfig';
import { UserSchema, UserConverter } from '../models/Users';
import { getDoc, doc, setDoc } from 'firebase/firestore';

export default function Preferences() {
    const {user} = useUser();
    const router = useRouter();
    const [selectedItems, setSelectedItems] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const items = [
      {imageUrl: "/crafts/knitting.png", text: "Knitting" },
      {imageUrl: "/crafts/crochet.png", text: "Crochet" },
      {imageUrl: "/crafts/embroidary.png", text: "Embroidery" },
      {imageUrl: "/crafts/paper.png", text: "Paper Crafts" },
      {imageUrl: "/crafts/ceramics.png", text: "Ceramics" },
      {imageUrl: "/crafts/felting.png", text: "Felting" },
      {imageUrl: "/crafts/sewing.png", text: "Sewing" },
      {imageUrl: "/crafts/jewelery.png", text: "Jewelery Making" },
      {imageUrl: "/crafts/candle.png", text: "Candle Making" },
    ];  

    useEffect(() => {
      console.log('User object:', user);
      if (user && user.id) {
        console.log('Fetching data for user:', user.id);
        const fetchData = async () => {
          try {
          const userDocRef = doc(db, 'users', user.id).withConverter(UserConverter);  
          const userDoc = await getDoc(userDocRef);
          console.log('Document reference:', userDocRef);
          console.log('User ID:', user.id);
          if (userDoc.exists) {
            console.log('User data found:', userDoc);
            console.log('Raw document data:', userDoc.data());
            const userData = userDoc.data();
            setUserData(userData);
            console.log('User data:', userData);
            setSelectedItems(userData?.interests?.items || []);
            console.log('Selected Items:', userData?.interests?.items);
          } else {
            console.error('User data not found', user.id);
          }
        } catch (e) {
          console.error('Error fetching user data', e);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
      }
    }, [user]);

    const handleCardClick = (item) => {
      console.log('Card clicked:', item.text);
      setSelectedItems((prevSelectedItems) => {
        if(prevSelectedItems.includes(item.text)) {
          return prevSelectedItems.filter((selectedItem) => selectedItem != item.text);
        } else {
          console.log('Item added:', item.text);
          return [...prevSelectedItems, item.text];
        }
      })
    };

    useEffect(() => {
      console.log('Updated Selected Items:', selectedItems);
    }, [selectedItems]);

    const savePreferences = async () => {
      console.log(userData)
      if (!userData) {
        console.error('No user data available to save preferences.');
        return;
      }    
      try {
        const updateUser = new UserSchema(
          userData.id,
          userData.username,
          userData.email,
          userData.following, 
          userData.posts,
          {total: selectedItems.length, items: selectedItems}
        );
        const userDocRef = doc(db, 'users', user.id).withConverter(UserConverter);
        await setDoc(userDocRef, updateUser);
        console.log('Preferences saved succesfully');
        router.push('/feed');
      } catch (e) {
        console.error('error saving preferences', e);
      }
    };


    if (loading) {
      return <div className="text-white">Loading user data...</div>;
    }


    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <h1 className="text-2xl font-bold mb-6 text-white">I Love...</h1>
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, index) => (
            <Card
            key={index}
            imageUrl={item.imageUrl}
            text={item.text}
            onClick={() => handleCardClick(item)}
            isSelected={selectedItems.includes(item.text)}
          />
          ))}
        </div>
        <button onClick={savePreferences} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Save Preferences
        </button>
      </div>
    );
}