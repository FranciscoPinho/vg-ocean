import React, { Component } from 'react';
import { Button, Checkbox, Form, Container, Grid, Input, Segment } from 'semantic-ui-react'
import './Login.css'

class LoginForm extends Component {

	handleFormSubmit(e) {
		e.preventDefault();
		console.log("clicking login!");
	}

	render() {
		return (
			<Container>
				<Grid columns={1} padded>
					<Grid.Column>
						<Form size='large'>
							<Form.Field>
								<label>E-mail</label>
								<Input
									icon='at'
									iconPosition='left'
									placeholder='your@email.com'
								/>
							</Form.Field>
							<Form.Field>
								<label>Password</label>
								<Input
									icon='key'
									iconPosition='left'
								/>
							</Form.Field>
							<p id="forgotpassword"> <small> <a href="https://localhost:3000"> Forgot password? </a></small> </p>
							<Form.Field>
								<Checkbox label='Remember me' />
							</Form.Field>
							<Segment basic textAlign='center'>
								<Button primary type='submit'>Login</Button>
							</Segment>
						</Form>
					</Grid.Column>
				</Grid>
			</Container>
		);
	}
}
export default LoginForm;