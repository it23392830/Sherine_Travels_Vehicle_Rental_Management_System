import styled from "styled-components"

// Define prop types for styled components
interface SignInProps {
  signinIn: boolean
}

const hideSigninProp = { shouldForwardProp: (prop: string) => prop !== "signinIn" }

export const Container = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 678px;
  max-width: 100%;
  min-height: 400px;
`

export const SignUpContainer = styled.div.withConfig(hideSigninProp)<SignInProps>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  ${(props) =>
    !props.signinIn
      ? `
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
  `
      : null}
`

export const SignInContainer = styled.div.withConfig(hideSigninProp)<SignInProps>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  ${(props) => (!props.signinIn ? `transform: translateX(100%);` : null)}
`

export const Form = styled.form`
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
`

export const Title = styled.h1`
  font-weight: bold;
  margin: 0;
  color: #333; // Added dark text color for form titles to ensure contrast on white background
`

export const Input = styled.input`
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
`

export const Button = styled.button`
  border-radius: 20px;
  border: 1px solid #917bc2ff;
  background-color: #917bc2ff;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: none;
  }
  
  &:hover {
    opacity: 0.9;
  }
`

export const GhostButton = styled(Button)`
  background-color: transparent;
  border-color: #ffffff;
  color: #ffffff; // Ensuring white text on transparent background for overlay buttons
`

export const Anchor = styled.a`
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`

export const OverlayContainer = styled.div.withConfig(hideSigninProp)<SignInProps>`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  ${(props) => (!props.signinIn ? `transform: translateX(-100%);` : null)}
`

export const Overlay = styled.div.withConfig(hideSigninProp)<SignInProps>`
  background: linear-gradient(to right, #3d179eff, #c16b7fff);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  ${(props) => (!props.signinIn ? `transform: translateX(50%);` : null)}
`

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  color: #ffffff; // Added white text color for overlay panels to ensure contrast on gradient background
`

export const LeftOverlayPanel = styled(OverlayPanel).withConfig(hideSigninProp)<SignInProps>`
  transform: translateX(-20%);
  ${(props) => (!props.signinIn ? `transform: translateX(0);` : null)}
`

export const RightOverlayPanel = styled(OverlayPanel).withConfig(hideSigninProp)<SignInProps>`
  right: 0;
  transform: translateX(0);
  ${(props) => (!props.signinIn ? `transform: translateX(20%);` : null)}
`

export const Paragraph = styled.p`
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
  color: #ffffff; // Added white text color for overlay paragraphs to ensure contrast on gradient background
`

export const GoogleButton = styled.button`
  border-radius: 20px;
  border: 1px solid #dadce0;
  background-color: #ffffff;
  color: #3c4043;
  font-size: 12px;
  font-weight: 500;
  padding: 12px 45px;
  letter-spacing: 0.5px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 10px 0;
  width: 100%;
  
  &:hover {
    background-color: #f8f9fa;
    border-color: #dadce0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
  }
`

export const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #333; // Changed from #666 to #333 for better contrast
  font-size: 12px;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #dadce0;
  }
  
  &::before {
    margin-right: 16px;
  }
  
  &::after {
    margin-left: 16px;
  }
`
