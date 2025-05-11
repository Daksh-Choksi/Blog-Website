// src/migrateLocalStorage.js
import axios from 'axios';
import { useEffect, useState } from 'react';

// Function to migrate localStorage data to the backend server
const migrateLocalStorageData = async () => {
  
  const localPosts = JSON.parse(localStorage.getItem("blogPublish")) || [];
  console.log(JSON.parse(localStorage.getItem("blogPublish")))
  try {
    // Fetch all profiles once
    const response = await axios.get('http://localhost:5000/profiles');
    const profiles = response.data;



    for (const post of localPosts) {
      let authorProfile = profiles.find(profile => profile.username === post.author)
      console.log(authorProfile)
      try {
        console.log(post)
        // Include authorId in the post data
        const postData = { ...post, authorId: authorProfile._id };
        console.log(postData)
        await axios.post('http://localhost:5000/posts', postData);
      } catch (error) {
        console.error('Error migrating post:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching profiles:', error);
  }

  // Optionally, you can clear the localStorage after migration
  localStorage.removeItem('blogPublish');
};

export default migrateLocalStorageData;
