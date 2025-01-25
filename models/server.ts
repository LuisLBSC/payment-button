import express, { Application }  from 'express';
import userRoutes from '../routes/user';
import rolesRoutes from '../routes/role';
import profilesRoutes from '../routes/profile';
import authRoutes from '../routes/auth';
import paramsRoutes from '../routes/param';
import debtRoutes from '../routes/debt';
import paymentRoutes from '../routes/payment';
import entitiesRoutes from '../routes/payment';
import paymentButtonRoutes from '../routes/paymentButton';
import cors from 'cors';

class Server{

  private app: Application;
  private port: string;
  private apiPaths = {
    users: '/api/users',
    roles: '/api/roles',
    profiles: '/api/profiles',
    debt: '/api/debt',
    auth: '/api/auth',
    params: '/api/params',
    payment: '/api/payment',
    entities: '/api/entity',
    paymentButton: '/api/paymentButton'
}

  constructor(){
    this.app = express();
    this.port = process.env.PORT || '3000';
    this.middlewares();
    this.routes();
  }

  middlewares (){
    //add this line for cors
    this.app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "auth-token, Content-Type");
        next();
      });
    this.app.use( cors() );
    this.app.use( express.json() );
    this.app.use( express.static('public') );
  }

  routes (){
      this.app.use(this.apiPaths.users, userRoutes);
      this.app.use(this.apiPaths.roles, rolesRoutes);
      this.app.use(this.apiPaths.profiles, profilesRoutes);
      this.app.use(this.apiPaths.auth, authRoutes);
      this.app.use(this.apiPaths.params, paramsRoutes);
      this.app.use(this.apiPaths.debt, debtRoutes);
      this.app.use(this.apiPaths.payment, paymentRoutes);
      this.app.use(this.apiPaths.entities, entitiesRoutes);
      this.app.use(this.apiPaths.paymentButton, paymentButtonRoutes);
  }
  
  listen(){
    this.app.listen(this.port, () => {
        console.log('Server iniciado: ' + this.port);
    })
  }
}

export default Server;