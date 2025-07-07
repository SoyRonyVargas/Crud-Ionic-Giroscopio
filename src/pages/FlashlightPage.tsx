// src/pages/FlashlightPage.tsx
import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { Flashlight } from '@awesome-cordova-plugins/flashlight';

const FlashlightPage: React.FC = () => {
    const [ isFlashlightOn, setIsFlashlightOn ] = React.useState(false);
  const toggleFlashlight = async () => {
    const isOn = await Flashlight.isSwitchedOn();
    if (isOn) {
      Flashlight.switchOff();
      
    } else {
      Flashlight.switchOn();
    }
    setIsFlashlightOn(!isOn);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding-horizontal !h-full !min-h-screen p-3 m-3">
        <button className='mt-5 flex mb-3 w-full justify-center items-center text-lg font-medium bg-purple-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow transition' onClick={toggleFlashlight}>
            {isFlashlightOn ? 'Apagar Linterna' : 'Encender Linterna'}
        </button>
      </IonContent>
    </IonPage>
  );
};

export default FlashlightPage;
