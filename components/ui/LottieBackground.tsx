'use client';

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import LottieErrorBoundary from './LottieErrorBoundary';

interface LottieBackgroundProps {
  animationType?: 'floating-stars' | 'gentle-bubbles' | 'rainbow-particles';
  className?: string;
}

// Inline Lottie animation data for floating stars
const floatingStarsAnimation = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 90,
  "w": 800,
  "h": 600,
  "nm": "FloatingStars",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Star 1",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            {"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":0,"s":[0]},
            {"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":30,"s":[100]},
            {"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":60,"s":[100]},
            {"t":90,"s":[0]}
          ],
          "ix": 11
        },
        "r": {
          "a": 1,
          "k": [
            {"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":0,"s":[0]},
            {"t":90,"s":[360]}
          ],
          "ix": 10
        },
        "p": {
          "a": 1,
          "k": [
            {"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":0,"s":[100,100,0],"to":[10,5,0],"ti":[-10,-5,0]},
            {"t":90,"s":[160,130,0]}
          ],
          "ix": 2
        },
        "s": {
          "a": 1,
          "k": [
            {"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":0,"s":[50,50,100]},
            {"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":45,"s":[80,80,100]},
            {"t":90,"s":[50,50,100]}
          ],
          "ix": 6
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ind": 0,
              "ty": "sh",
              "ix": 1,
              "ks": {
                "a": 0,
                "k": {
                  "i": [[0,0],[0,0],[0,0],[0,0],[0,0]],
                  "o": [[0,0],[0,0],[0,0],[0,0],[0,0]],
                  "v": [[0,-20],[-5,-5],[-20,0],[-5,5],[0,20],[5,5],[20,0],[5,-5]],
                  "c": true
                },
                "ix": 2
              },
              "nm": "Path 1",
              "mn": "ADBE Path Group",
              "hd": false
            },
            {
              "ty": "fl",
              "c": {
                "a": 0,
                "k": [1, 0.8, 0.2, 1],
                "ix": 4
              },
              "o": {
                "a": 0,
                "k": 100,
                "ix": 5
              },
              "r": 1,
              "bm": 0,
              "nm": "Fill 1",
              "mn": "ADBE Fill",
              "hd": false
            }
          ],
          "nm": "Star Shape",
          "np": 2,
          "cix": 2,
          "bm": 0,
          "ix": 1,
          "mn": "ADBE Shape Group",
          "hd": false
        }
      ],
      "ip": 0,
      "op": 90,
      "st": 0,
      "bm": 0
    }
  ],
  "markers": []
};

export default function LottieBackground({
  animationType = 'floating-stars',
  className = '',
}: LottieBackgroundProps) {
  const lottieRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  const getAnimationData = () => {
    switch (animationType) {
      case 'floating-stars':
        return floatingStarsAnimation;
      default:
        return floatingStarsAnimation;
    }
  };

  if (hasError) {
    return null; // Don't render anything if there's an error
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <LottieErrorBoundary fallback={null}>
        <Lottie
          lottieRef={lottieRef}
          animationData={getAnimationData()}
          loop
          autoplay
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.3,
          }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
          onError={() => {
            console.warn('LottieBackground animation error');
            setHasError(true);
          }}
        />
      </LottieErrorBoundary>
    </div>
  );
}