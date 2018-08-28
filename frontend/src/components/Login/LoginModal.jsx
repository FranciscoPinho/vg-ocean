import React, { Component } from 'react';
import { Button, Checkbox, Form, Grid, Input, Segment, Header, Modal } from 'semantic-ui-react';
import './Login.css';
import { connect } from 'react-redux';
import {closeAll,openLogin,openRegister} from '../../actions/modalActions';

// getting the desired parts from the general store and mapping them to this component's props
const mapStateToProps = state => {
    return {
        openReg: state.modals.openReg,
        openLogin: state.modals.openLogin
    }
}

const mapDispatchToProps = dispatch => {
    return {
        show: () =>
            dispatch(openLogin()),
        switch: () =>
            dispatch(openRegister()),
        close: () =>
            dispatch(closeAll())
    }
}

class LoginModal extends Component {
    render() {

        return (
            <div id='mod-login'>
                <Modal dimmer='blurring' open={this.props.openLogin} onClose={this.props.closeAll} size='tiny' trigger={<Button onClick={this.props.show}> Sign in</Button>}>
                    <Header icon='paper plane outline' content='Sign in' />
                    <Modal.Content>
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
                                    <p> <small> <a href="localhost:3000"> Forgot password? </a></small> </p>
                                    <Form.Field>
                                        <Checkbox label='Remember me' />
                                    </Form.Field>
                                    <Segment basic textAlign='center'>
                                        <Button size='large' primary type='submit'>Login</Button>
                                    </Segment>
                                    <Segment basic textAlign='right'>
                                        <Button size='small' id='toReg' basic color='teal' content="Don't have an account?" onClick={this.props.switch} />
                                    </Segment>
                                </Form>
                            </Grid.Column>
                        </Grid>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginModal)
