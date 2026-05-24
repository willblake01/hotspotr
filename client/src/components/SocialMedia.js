import React from 'react';

export const SocialMedia = ({socialClass}) => (
    <div className={socialClass}>
        <a href='https://www.facebook.com' target='_blank' rel='noopener noreferrer'>
            <img src='https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/facebook-brown.svg' className='social-icon' alt='facebook' />
        </a>
        <a href='https://www.twitter.com' target='_blank' rel='noopener noreferrer'>
            <img src='https://res.cloudinary.com/willblake01/image/upload/v1538510016/hotspotr/twitter-brown.svg' className='social-icon' alt='twitter' />
        </a>
        <a href='https://www.instagram.com' target='_blank' rel='noopener noreferrer'>
            <img src='https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/instagram-brown.svg' className='social-icon' alt='instagram' />
        </a>
    </div>
)
