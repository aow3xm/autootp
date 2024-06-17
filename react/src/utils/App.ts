import React, { useState, useEffect } from "react";
import {
  account,
  login,
  register,
  getMessage,
  deleteAccount,
} from "./services/mail.ts";
import "bootstrap/dist/css/bootstrap.min.css";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [accounts, setAccounts] = useState<account[]>([]);
  const password = "Minh2021";
  const [email, setEmail] = useState<string>("");

  const generateRandomEmail = (): string => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }
    return randomString + "@fthcapital.com";
  };

  const handleRegister = async (): Promise<void> => {
    const newAccount: account = {
      address: generateRandomEmail(),
      password,
    };
    const res = await register(newAccount);
    if (res?.status === 201) {
      const loginRes = await login(newAccount);
      if (loginRes?.status === 200) {
        res.data.token = loginRes.data.token;
        res.data.id = loginRes.data.id;
        setAccounts((prevAccounts) => [res.data, ...prevAccounts]);
      }
    }
  };

  const handlePasteEmail = async (email: string): Promise<void> => {
    const newAccount: account = {
      address: email,
      password,
    };
    const loginRes = await login(newAccount);
    if (loginRes?.status === 200) {
      loginRes.data.token = loginRes.data.token;
      loginRes.data.id = loginRes.data.id;
      loginRes.data.address = newAccount.address;
      loginRes.data.password = newAccount.password;
      setAccounts((prevAccounts) => [loginRes.data, ...prevAccounts]);
    }
  };

  const fetchOTPs = async () => {
    const updatedAccounts = await Promise.all(
      accounts.map(async (account) => {
        if (account.token) {
          const messages = await getMessage(account.token);
          if (
            messages &&
            messages.data &&
            Array.isArray(messages.data["hydra:member"]) &&
            messages.data["hydra:member"].length > 0
          ) {
            const latestMessage = messages.data["hydra:member"][0];
            const otpMatch = latestMessage.subject.match(/(\d{6})/);
            const otp = otpMatch ? otpMatch[1] : null;
            return {
              ...account,
              otp: otp,
            };
          }
        }
        return account;
      })
    );
    setAccounts(updatedAccounts);
  };

  useEffect(() => {
    const interval = setInterval(fetchOTPs, 1000);
    return () => clearInterval(interval);
  }, [accounts]);

  const handleDelete = async (id: string, token: string) => {
    const res = await deleteAccount(id, token);
    if (res?.status === 204) {
      setAccounts(accounts.filter((account) => account.id !== id));
    }
  };

  const handleCopy = (text: string, field: string) => {
    copy(text);
    toast.success(`${field} copied to clipboard!`, {
      autoClose: 500,
    });
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value.trim());
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handlePasteEmail(email);
  };

  return (
    <div className="container">
      <pre className="pt-5">
        Dán email vào ô bên dưới sau đó đăng nhập với email đã nhận được từ đơn
        hàng
        <br />
        OTP sẽ gửi đến sau 5 giây.
        <br />
        Trường hợp OTP không gửi đến, vui lòng click vào{" "}
        <a href="https://mail.tm/">đây</a> để đăng nhập thủ công , mật khẩu :
        Minh2021
        <br />
        <span className="text-danger">
          vui lòng không xoá email, không bảo hành xoá nhầm
        </span>
      </pre>
      <form onSubmit={handleFormSubmit} className="form-group">
        <div className="form-group d-flex">
          <input
            className="form-control w-25"
            type="text"
            placeholder="Dán email vào đây"
            name="email"
            value={email}
            onChange={handleEmailChange}
          />
          <button className="btn btn-primary" type="submit">
            Nhận OTP
          </button>
        </div>
      </form>
      <ToastContainer />
      <button className="btn btn-primary my-3" onClick={handleRegister}>
        Create
      </button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Email</th>
            <th>Password</th>
            <th>OTP</th>
            <th>
              Action <br />
            </th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td>
                {account.address}{" "}
                <button
                  className="btn btn-sm btn-link"
                  onClick={() => handleCopy(account.address, "Email")}
                >
                  Copy
                </button>
              </td>
              <td>
                {password}{" "}
                <button
                  className="btn btn-sm btn-link"
                  onClick={() => handleCopy(password, "Password")}
                >
                  Copy
                </button>
              </td>
              <td>
                {account.otp}{" "}
                {account.otp && (
                  <button
                    className="btn btn-sm btn-link"
                    onClick={() => handleCopy(account.otp!, "OTP")}
                  >
                    Copy
                  </button>
                )}
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(account.id!, account.token!)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
