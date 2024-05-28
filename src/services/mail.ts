import axios from "axios";

const URL = "https://api.mail.tm";
export interface account {
  address: string;
  password: string;
  id?: string;
  token?: string;
  createdAt?: Date;
  isDeleted?: boolean;
  otp?: string;
}

export const register = async (account: account) => {
  try {
    return await axios.post(`${URL}/accounts`, account);
  } catch (error) {
    console.log("error", error);
  }
};

export const login = async (account: account) => {
  try {
    return await axios.post(`${URL}/token`, account);
  } catch (error) {
    console.log("error", error);
  }
};

export const deleteAccount = async(id:string,token:string)=>{
try {
    return await axios.delete(`${URL}/accounts/${id}`,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    })
} catch (error) {
    
}
}

export const getMessage = async (token: string) => {
  try {
    return await axios.get(`${URL}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log("error", error);
  }
};

