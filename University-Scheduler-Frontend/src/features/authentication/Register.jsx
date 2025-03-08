import React, { useState, useEffect } from "react";
import AnimatedPage from "../../pages/AnimatedPage";
import GoldButton from "../../components/buttons/GoldButton";
import {
  Collapse,
  ConfigProvider,
  Select,
  notification,
  Input,
  Form,
  Button,
  Spin,
} from "antd";

import { useSelector, useDispatch } from "react-redux";
import { getFaculties, getYears, registerUser } from "./auth.api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form] = Form.useForm();

  const [role, setRole] = React.useState("student");

  const { loading, error, faculties, years } = useSelector(
    (state) => state.auth
  );

  console.log(role);

  const openNotificationWithIcon = (type, title, description) => {
    notification[type]({
      message: title,
      description,
    });
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getFaculties());
    dispatch(getYears());
  }, [dispatch]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const [subgroupOptions, setSubgroupOptions] = useState([]);

  const handleSelectChange = (field, value) => {
    if (field === "year") {
      const selectedYear = years.find((y) => y.name === value);
      if (selectedYear) {
        setSubgroupOptions(
          selectedYear.subgroups.map((subgroup) => ({
            value: subgroup.code,
            label: subgroup.name,
          }))
        );
      } else {
        setSubgroupOptions([]);
      }
    }
  };

  const handleSubmit = async (values) => {
    console.log(values);
    if (values.role === "faculty") {
      delete values.faculty;
      delete values.year;
      delete values.subgroup;
    }
    try {
      const result = await dispatch(registerUser(values));
      console.log(result);
      if (result.payload) {
        openNotificationWithIcon(
          "success",
          "Registration Successful",
          "You have successfully registered"
        );
        navigate("/");
      } else {
        openNotificationWithIcon(
          "error",
          "Registration Failed",
          "Invalid credentials"
        );
      }
    } catch (err) {
      console.error(err);
      openNotificationWithIcon("error", "Registration Failed", err.message);
    }
  };

  const changeRole = (value) => {
    setRole(value);
    console.log(value);
  };

  return (
    <AnimatedPage>
      <div className="flex flex-col justify-center items-center h-full">
        <div className="flex flex-row w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="w-2/3 p-6">
            <h2 className="text-2xl font-semibold mb-6">Register</h2>
            <Form form={form} onFinish={handleSubmit} labelCol={{ span: 24 }}>
              <div className="mb-4">
                <Form.Item
                  label={<span className="text-gwhite">University ID</span>}
                  name="id"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your University ID",
                    },
                    {
                      pattern: /^(FA|ST)\d{7}$/,
                      message:
                        "ID must be in the format FA or ST followed by 7 digits",
                    },
                  ]}
                >
                  <Input placeholder="Enter your University ID" />
                </Form.Item>
              </div>

              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Email</span>}
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your email" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Username</span>}
                    name="username"
                    rules={[
                      { required: true, message: "Please enter your username" },
                    ]}
                  >
                    <Input placeholder="Enter your username" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">First Name</span>}
                    name="first_name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Last Name</span>}
                    name="last_name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your last name" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Password</span>}
                    name="password"
                    rules={[
                      { required: true, message: "Please enter your password" },
                    ]}
                  >
                    <Input.Password placeholder="Enter your password" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={
                      <span className="text-gwhite">Confirm Password</span>
                    }
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Confirm your password" />
                  </Form.Item>
                </div>
              </div>

              {role === "student" && (
                <>
                  <div className="mb-4">
                    <Form.Item
                      label={<span className="text-gwhite">Faculty</span>}
                      name="faculty"
                      rules={[
                        { required: true, message: "Please select a faculty" },
                      ]}
                    >
                      <Select
                        placeholder="Select Faculty"
                        options={faculties.map((faculty) => ({
                          value: faculty.code,
                          label: faculty.long_name,
                        }))}
                      />
                    </Form.Item>
                  </div>

                  <div className="mb-4">
                    <Form.Item
                      label={<span className="text-gwhite">Year</span>}
                      name="year"
                      rules={[
                        { required: true, message: "Please select a year" },
                      ]}
                    >
                      <Select
                        placeholder="Select Year"
                        options={years.map((year) => ({
                          value: year.name,
                          label: year.long_name,
                        }))}
                        onChange={(value) => handleSelectChange("year", value)}
                      />
                    </Form.Item>
                  </div>

                  <div className="mb-4">
                    <Form.Item
                      label={<span className="text-gwhite">Subgroup</span>}
                      name="subgroup"
                      rules={[
                        { required: true, message: "Please select a subgroup" },
                      ]}
                    >
                      <Select
                        placeholder="Select Subgroup"
                        options={subgroupOptions}
                      />
                    </Form.Item>
                  </div>
                </>
              )}

              {role === "faculty" && (
                <div className="mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Position</span>}
                    name="position"
                    rules={[
                      { required: true, message: "Please select a position" },
                    ]}
                  >
                    <Select
                      placeholder="Select Position"
                      options={[
                        { value: "Lecturer", label: "Lecturer" },
                        { value: "Senior Lecturer", label: "Senior Lecturer" },
                        {
                          value: "Assistant Lecturer",
                          label: "Assistant Lecturer",
                        },
                        { value: "Lab Assistant", label: "Lab Assistant" },
                        { value: "Instructor", label: "Instructor" },
                      ]}
                    />
                  </Form.Item>
                </div>
              )}

              <Button type="primary" htmlType="submit" bgcolor={"#243647"}>
                {loading ? <Spin /> : "Register"}
              </Button>
            </Form>
          </div>

          <div className="w-1/3 p-6 bg-gray-100">
            <h2 className="text-xl font-semibold mb-4">Select Role</h2>
            <Select
              value={role}
              onChange={(values) => changeRole(values)}
              style={{ width: "100%" }}
              options={[
                { value: "student", label: "Student" },
                { value: "faculty", label: "Teacher" },
              ]}
            />
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Register;
