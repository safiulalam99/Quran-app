'use client';

import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

interface SuccessLottieProps {
  isVisible: boolean;
  onComplete?: () => void;
}

// Simple celebration animation data
const celebrationAnimation = {
  "v": "5.7.4",
  "fr": 60,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Celebration",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Confetti",
      "sr": 1,
      "ks": {
        "o": {
          "a": 1,
          "k": [
            {"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},
            {"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":10,"s":[100]},
            {"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":50,"s":[100]},
            {"t":60,"s":[0]}
          ],
          "ix": 11
        },
        "r": {
          "a": 1,
          "k": [
            {"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},
            {"t":60,"s":[720]}
          ],
          "ix": 10
        },
        "p": {
          "a": 1,
          "k": [
            {"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":0,"s":[100,60,0],"to":[0,15,0],"ti":[0,-15,0]},
            {"t":60,"s":[100,150,0]}
          ],
          "ix": 2
        },
        "s": {
          "a": 1,
          "k": [
            {"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"t":0,"s":[0,0,100]},
            {"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"t":10,"s":[120,120,100]},
            {"i":{"x":[0.833,0.833,0.833],"y":[0.833,0.833,0.833]},"o":{"x":[0.167,0.167,0.167],"y":[0.167,0.167,0.167]},"t":30,"s":[100,100,100]},
            {"t":60,"s":[0,0,100]}
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
              "d": 1,
              "ty": "el",
              "s": {
                "a": 0,
                "k": [20, 20],
                "ix": 2
              },
              "p": {
                "a": 0,
                "k": [0, 0],
                "ix": 3
              },
              "nm": "Ellipse Path 1",
              "mn": "ADBE Ellipse",
              "hd": false
            },
            {
              "ty": "fl",
              "c": {
                "a": 0,
                "k": [0.2, 0.8, 0.4, 1],
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
          "nm": "Ellipse 1",
          "np": 3,
          "cix": 2,
          "bm": 0,
          "ix": 1,
          "mn": "ADBE Shape Group",
          "hd": false
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0,
      "bm": 0
    }
  ],
  "markers": []
};

export default function SuccessLottie({
  isVisible,
  onComplete,
}: SuccessLottieProps) {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (isVisible && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [isVisible]);

  const handleComplete = () => {
    onComplete?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <Lottie
        lottieRef={lottieRef}
        animationData={celebrationAnimation}
        loop={false}
        autoplay={false}
        onComplete={handleComplete}
        style={{
          width: '200px',
          height: '200px',
        }}
      />
    </div>
  );
}