import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Togglable from './Togglable'

describe('<Togglable />', () => {
  // before each function gets called before every test and renders the togglable component
  beforeEach(() => {
    render(
      <Togglable buttonLabel="show...">
        <div>togglable content</div>
      </Togglable>
    )
  })
  // verify that the togglable component renders its child component
  test('renders its children', () => {
    screen.getByText('togglable content')
  })
  // verifies that the child component of the togglable component is not visible initially
  test('at start the children are not displayed', () => {
    const element = screen.getByText('togglable content')
    expect(element).not.toBeVisible()
  })
  // verify that the child component is visible when the button is pressed
  test('after clicking the button, children are displayed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const element = screen.getByText('togglable content')
    expect(element).toBeVisible()
  })
  // verify that the visible content can be hidden by clicking the second button of the component
  test('toggled content can be closed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const closeButton = screen.getByText('cancel')
    await user.click(closeButton)

    const element = screen.getByText('togglable content')
    expect(element).not.toBeVisible()
  })

})