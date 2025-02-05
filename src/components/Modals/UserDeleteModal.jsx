import PropTypes from 'prop-types';
import { Modal, Button, Typography } from '@mui/material';

const UserDeleteModal = ({ open, onClose, onConfirm, user }) => {
    return (
        <Modal 
            open={open} 
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
            }}
        >
            <div style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                maxWidth: '300px',  // Reduced from 400px
                width: '90%',       // Make it responsive
                margin: 'auto',
                marginTop: '100px',
            }}>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
                    Confirm Deletion
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', marginBottom: 3 }}>
                    Are you sure you want to delete {user?.email}?
                </Typography>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: '8px'  // Add space between buttons
                }}>
                    <Button 
                        variant="outlined" 
                        onClick={onClose} 
                        size="small"    // Make buttons smaller
                        sx={{ 
                            borderRadius: 12,
                            textTransform: 'none'  // Remove uppercase transform
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={onConfirm} 
                        size="small"    // Make buttons smaller
                        sx={{ 
                            borderRadius: 12,
                            backgroundColor: "#007AFF",
                            textTransform: 'none',  // Remove uppercase transform
                            "&:hover": { backgroundColor: "#007AFF" }
                        }}
                    >
                        Delete
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