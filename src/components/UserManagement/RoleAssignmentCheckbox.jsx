import PropTypes from 'prop-types';
import { Checkbox, FormControlLabel } from '@mui/material';

const RoleAssignmentCheckbox = ({ user, onRoleChange }) => {
    const handleChange = (event) => {
        const { checked } = event.target;
        onRoleChange(user.id, checked ? 'roleName' : ''); // Replace 'roleName' with the actual role you want to assign
    };

    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={user.roleName} // Replace 'roleName' with the actual role property
                    onChange={handleChange}
                    color="primary"
                />
            }
            label={user.email} // Display the user's email or role name
        />
    );
};

// Define prop types
RoleAssignmentCheckbox.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired, // Assuming user has an id property
        email: PropTypes.string.isRequired, // Assuming user has an email property
        roleName: PropTypes.bool, // Assuming roleName is a boolean
    }).isRequired,
    onRoleChange: PropTypes.func.isRequired, // Validate that onRoleChange is a required function
};

export default RoleAssignmentCheckbox; 