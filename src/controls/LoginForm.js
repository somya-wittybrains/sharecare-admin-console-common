import React, { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Segment, Header, Form } from 'semantic-ui-react';
import { ModelStoreContext } from '../model';

const LoginForm = observer(function LoginForm () {
  const { authStore } = useContext(ModelStoreContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Segment>
      <Form>
        <Header>Sharecare Care Console</Header>
        <Form.Input
          label='Username'
          placeholder='Username'
          value={username}
          onChange={(e, d) => setUsername(d.value)}
        />
        <Form.Input
          label='Password'
          placeholder='Password'
          value={password}
          onChange={(e, d) => setPassword(d.value)}
          type='password'
        />
        <Form.Button
          primary
          onClick={() => authStore.login(username, password)}
        >
          Log In
        </Form.Button>
      </Form>
    </Segment>
  );
});

LoginForm.propTypes = {};

export default LoginForm;
