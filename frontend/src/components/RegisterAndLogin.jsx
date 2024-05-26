import React, { useContext, useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBInput,
  MDBIcon,
} from "mdb-react-ui-kit";
import axios from "axios";
import { UserContext } from "../UserContext";

function Register() {
  const { setUsername, setId } = useContext(UserContext);
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isSigned, setIsSigned] = useState('register');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isSigned === 'register' ? 'register' : 'login';
    const payload = isSigned === 'register' 
      ? { user, email, pass } 
      : { user, pass };

    try {
      const { data } = await axios.post(url, payload);
      setUsername(user);
      setId(data.id);
    } catch (error) {
      console.error('Error:', error.response.data);
    }
  };

  return (
    <div className="bg-blue-100 min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit}>
        <MDBContainer fluid>
          <MDBCard className="text-black m-5" style={{ borderRadius: "25px" }}>
            <MDBCardBody>
              <MDBRow>
                <MDBCol
                  md="10"
                  lg="6"
                  className="order-2 order-lg-1 d-flex flex-column align-items-center"
                >
                  <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                    {isSigned === 'register' ? 'Sign up' : 'Login to your account'}
                  </p>

                  <div className="d-flex flex-row align-items-center mb-4">
                    <MDBIcon fas icon="user me-3" size="lg" />
                    <MDBInput
                      label="Your Username"
                      id="form1"
                      value={user}
                      name="user"
                      onChange={e => setUser(e.target.value)}
                      style={{ minWidth: "20vw" }}
                      type="text"
                      className="w-100"
                    />
                  </div>

                  {isSigned === 'register' && (
                    <div className="d-flex flex-row align-items-center mb-4">
                      <MDBIcon fas icon="envelope me-3" size="lg" />
                      <MDBInput
                        label="Your Email"
                        id="form2"
                        value={email}
                        name="email"
                        onChange={e => setEmail(e.target.value)}
                        style={{ minWidth: "20vw" }}
                        type="email"
                      />
                    </div>
                  )}

                  <div className="d-flex flex-row align-items-center mb-4">
                    <MDBIcon fas icon="lock me-3" size="lg" />
                    <MDBInput
                      label="Password"
                      id="form3"
                      value={pass}
                      name="pass"
                      onChange={e => setPass(e.target.value)}
                      style={{ minWidth: "20vw" }}
                      type="password"
                    />
                  </div>

                  {isSigned === 'register' && (
                    <div className="d-flex flex-row align-items-center mb-4">
                      <MDBIcon fas icon="key me-3" size="lg" />
                      <MDBInput
                        label="Confirm Password"
                        id="form4"
                        style={{ minWidth: "20vw" }}
                        type="password"
                      />
                    </div>
                  )}

                  <MDBBtn className="mb-4" size="sm" style={{ marginLeft: "2.6em", minWidth: "20vw", minHeight: "6.5vh" }}>
                    {isSigned === 'register' ? 'Register' : 'Login'}
                  </MDBBtn>

                  {isSigned === 'register' ? (
                    <div className="d-flex justify-content-center w-100" style={{ marginLeft: "2em" }}>
                      <p className="mx-2" style={{ color: "#6495ED" }}>
                        Already registered? <span style={{ color: "white" }}>.</span> 
                        <button type="button" onClick={() => setIsSigned('login')}>Login Now</button>
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center w-100" style={{ marginLeft: "2em" }}>
                      <p className="mx-2" style={{ color: "#6495ED" }}>
                        Don't have an account? <span style={{ color: "white" }}>.</span> 
                        <button type="button" onClick={() => setIsSigned('register')}>Register Now</button>
                      </p>
                    </div>
                  )}
                </MDBCol>

                <MDBCol
                  md="10"
                  lg="6"
                  className="order-1 order-lg-2 d-flex align-items-center"
                >
                  <MDBCardImage
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                    fluid
                  />
                </MDBCol>
              </MDBRow>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </form>
    </div>
  );
}

export default Register;
