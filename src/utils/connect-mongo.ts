import mongoose,{ConnectOptions} from 'mongoose';

const connectDB = async () => {
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGODB_URI as string).then(async (res) => {
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      
    
    }).catch(error => {
       console.log(error);
     });
};





export default connectDB;
