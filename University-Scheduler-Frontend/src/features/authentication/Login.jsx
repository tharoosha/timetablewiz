import React, { useState } from "react";
import GoldButton from "../../components/buttons/GoldButton";
import { Form, Input, notification, Spin, Button } from "antd";
import AnimatedPage from "../../pages/AnimatedPage";
import { loginUser } from "./auth.api";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function Login() {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const openNotificationWithIcon = (type, title, description) => {
    notification[type]({
      message: title,
      description,
    });
  };

  const login = async (values) => {
    try {
      const result = await dispatch(loginUser(values));
      if (result.payload) {
        const { access_token, token_type, role } = result.payload;
        if (role && access_token) {
          console.log(result.payload);

          localStorage.setItem("token", `${token_type} ${access_token}`);
          localStorage.setItem("role", `${role}`);

          openNotificationWithIcon(
            "success",
            "Login Successful",
            "You have successfully logged in"
          );
          navigate("/");
        } else {
          openNotificationWithIcon(
            "error",
            "Login Failed",
            "Invalid credentials"
          );
        }
      } else {
        openNotificationWithIcon(
          "error",
          "Login Failed",
          result.payload || "Invalid credentials"
        );
      }
    } catch (err) {
      openNotificationWithIcon("error", "Login Failed", err.message);
    }
  };

  return (
    <AnimatedPage>
      <div className="flex flex-col justify-center items-center h-full">
        <div className="flex flex-row w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="w-1/2 p-8 bg-gray-100">
            <h2 className="text-4xl font-semibold mb-6">Welcome Back!</h2>
            <div>
              Log in to your account to access your timetable and other features
            </div>
          </div>
          <div className="w-1/2 p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Login to TimeTableWiz
            </h2>
            <Form
              form={form}
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={login}
              labelCol={{ span: 24 }}
            >
              <Form.Item
                label={<span className="text-gwhite">ID</span>}
                name="id"
                rules={[
                  { required: true, message: "Please enter your ID" },
                  {
                    pattern: /^(AD|FA|ST)\d{7}$/,
                    message:
                      "ID must start with FA, AD or ST followed by 7 digits",
                  },
                ]}
              >
                <Input type="text" placeholder="Enter your ID" />
              </Form.Item>

              <Form.Item
                label={<span className="text-gwhite">Password</span>}
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>

              <Form.Item className="mb-4 text-center">
                <Button type="primary" htmlType="submit" bgcolor={"#243647"}>
                  {loading ? <Spin /> : "Login"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Login;
