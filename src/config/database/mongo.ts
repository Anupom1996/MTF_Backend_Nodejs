import mongoose from 'mongoose';

/** Improvemnet incomplete, We will do it later */
export interface IMongoConfig {
  host: string;
  port: number;
  database: string;
}

export interface IProtectedMongoConfig extends IMongoConfig {
  username: string;
  password: string;
  authDatabase: string;
}

/**
 * This function is used for connecting database
 */

export const connect = (): void => {
  let connectioString = '';
  if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
    connectioString = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_AUTHENTICATION_DATABASE}`;
  } else {
    connectioString = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
  }
  const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  };
  console.log('connectioString', connectioString);
  mongoose.connect(connectioString, option, function (err) {
    if (err) {
      console.log('Mongo DB Connection Error', err);
    } else {
      console.log('Mongo DB Connected');
    }
  });
};
