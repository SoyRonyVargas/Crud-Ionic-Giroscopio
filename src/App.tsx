import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, Switch } from 'react-router-dom';

import ProductList from './pages/ProductList';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import CarritoPage from './pages/CarritoPage';
import FlashlightPage from './pages/FlashlightPage';

const App: React.FC = () => {
  return (
    <IonApp className="bg-gray-50">
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            {/* Rutas más específicas primero */}
            <Route exact path="/products/new" component={ProductCreatePage} />
            <Route exact path="/products/edit/:id" component={ProductEditPage} />
            <Route exact path="/products" component={ProductList} />
            <Route exact path="/flash" component={FlashlightPage} />
            <Route path="/carrito" component={CarritoPage} />
            <Redirect exact from="/" to="/products" />
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
