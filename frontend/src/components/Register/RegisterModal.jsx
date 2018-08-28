import React, { Component } from 'react';
import { Button, Checkbox, Form, Grid, Input, Segment, Header, Icon, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';
import {closeAll,openLogin,openRegister} from '../../actions/modalActions';

// getting the desired parts from the general store and mapping them to this component's props
const mapStateToProps = (state) => {
    return {
        openReg: state.modals.openReg,
        openLogin: state.modals.openLogin
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        show: () =>
            dispatch(openRegister()),
        switch: () =>
            dispatch(openLogin()),
        close: () =>
            dispatch(closeAll())
    }
}   
class RegisterModal extends Component {
    render() {

        return (
            <div id='mod-register'>
                <Modal dimmer='blurring' open={this.props.openReg} onClose={this.props.close} size='tiny' trigger={<Button onClick={this.props.show}>Register</Button>}>
                    <Header icon='paper plane' content='Sign up' />
                    <Modal.Content>
                        <Grid columns={1} padded>
                            <Grid.Column>
                                <Form size='large'>
                                    <Form.Field>
                                        <label>Username</label>
                                        <Input
                                            required
                                            icon='user'
                                            iconPosition='left'
                                            placeholder='Must be unique etc etc...'
                                        />
                                    </Form.Field>
                                    <Form.Group widths='equal'>
                                        <Form.Field
                                            id='form-input-control-first-name'
                                            control={Input}
                                            label='First name'
                                        />
                                        <Form.Field
                                            id='form-input-control-last-name'
                                            control={Input}
                                            label='Last name'
                                            placeholder='(optional)'
                                        />
                                    </Form.Group>
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
                                    <Form.Field>
                                        <label>Confirm password</label>
                                        <Input
                                            icon='key'
                                            iconPosition='left'
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Checkbox label='I agree to the terms and conditions of use' />
                                    </Form.Field>
                                    <Segment basic textAlign='center'>
                                        <Button primary type='submit'>Register</Button>
                                    </Segment>
                                    <Segment basic textAlign='right'>
                                        <Button size='small' id='toReg' basic color='teal' content="Already have an account?" onClick={this.props.switch} />
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
)(RegisterModal)


