// src/pages/FlashlightPage.tsx
import React from 'react';
import { IonPage, IonButton, IonContent } from '@ionic/react';
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
      <IonContent className="ion-padding-horizontal !h-full !min-h-screen">
        <IonButton expand="block" onClick={toggleFlashlight}>
            {isFlashlightOn ? 'Apagar Linterna' : 'Encender Linterna'}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default FlashlightPage;
