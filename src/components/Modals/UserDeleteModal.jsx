import PropTypes from 'prop-types';
import { Modal, Button, Typography } from '@mui/material';

const UserDeleteModal = ({ open, onClose, onConfirm, user }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', maxWidth: '400px', margin: 'auto', marginTop: '100px' }}>
                <Typography variant="h6">Confirm Deletion</Typography>
                <Typography>Are you sure you want to delete {user?.email}?</Typography>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={onConfirm} 
                        sx={{ borderRadius: 12 }} // Rounded corners for the Delete button
                    >
                        Delete
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={onClose} 
                        sx={{ borderRadius: 12 }} // Rounded corners for the Cancel button
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

UserDeleteModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    user: PropTypes.object,
};

export default UserDeleteModal; 