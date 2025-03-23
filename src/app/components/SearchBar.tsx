'use client';
import React, {useState} from 'react';
import {db} from '../../../utils/firebaseConfig';
import {collection, query, where, getDocs, orderBy, limit} from 'firebase/firestore';

const SearchBar: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value.trim() !== '') {
            
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('username', '>=', value.toLowerCase()), where('username', '<=', value.toLowerCase() + '\uf8ff'), 
            orderBy('username'), limit(10));
            const querySnapshot = await getDocs(q);
            const userList = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setResults(userList);
            console.log("Search Term:", value);
            console.log("Query Snapshot:", querySnapshot.docs.map((doc) => doc.data()));

        } else {
            setResults([]);
        }
    };


    return (
        <div className="group" style={{ position: 'relative' }}>
            <svg 
                className="icon" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
            >
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8c1.66 0 3.23-.51 4.57-1.39l5.55 5.55 1.41-1.41-5.55-5.55C17.49 13.23 18 11.66 18 10c0-4.42-3.58-8-8-8zm0 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z" />
            </svg>
            <input
                className="input"
                type="text"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={handleSearch}
            />
            {results.length > 0 && (
                <div className="results-box">
                    {results.map((result) => (
                        <div key={result.id} className="result-item">
                            <a href={`/profile/${result.id}`}>{result.username}</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}    

export default SearchBar;