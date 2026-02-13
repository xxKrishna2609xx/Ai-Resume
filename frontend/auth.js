// Authentication Module
// Handles user login, logout, session management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.auth = null;
        this.db = null;
    }

    // Initialize Firebase Auth
    async initialize() {
        try {
            // Firebase should already be initialized in the HTML
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // Listen for auth state changes
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    await this.handleUserLogin(user);
                } else {
                    this.handleUserLogout();
                }
            });
            
            return true;
        } catch (error) {
            console.error('Auth initialization error:', error);
            return false;
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await this.auth.signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle user login (fetch/create user profile)
    async handleUserLogin(firebaseUser) {
        try {
            // Get or create user profile in Firestore
            const userDoc = await this.db.collection('users').doc(firebaseUser.uid).get();
            
            if (!userDoc.exists) {
                // New user - need to set up profile
                this.currentUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    needsProfileSetup: true
                };
                
                // Redirect to role selection if on index/dashboard
                if (window.location.pathname !== '/static/login.html' && 
                    window.location.pathname !== '/static/setup-profile.html') {
                    window.location.href = '/static/setup-profile.html';
                }
            } else {
                // Existing user
                this.currentUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    ...userDoc.data()
                };
                
                // Update UI
                this.updateUIForLoggedInUser();
            }
            
            // Store in sessionStorage for quick access
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
        } catch (error) {
            console.error('Error handling user login:', error);
        }
    }

    // Handle user logout
    handleUserLogout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/static/login.html') {
            window.location.href = '/static/login.html';
        }
    }

    // Sign out
    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        // Try from memory first
        if (this.currentUser) return this.currentUser;
        
        // Try from sessionStorage
        const stored = sessionStorage.getItem('currentUser');
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return this.currentUser;
        }
        
        return null;
    }

    // Get Firebase ID token for API calls
    async getIdToken() {
        const user = this.auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        return null;
    }

    // Create user profile in Firestore
    async createUserProfile(profileData) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('No authenticated user');

            const userProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: profileData.role, // 'job_seeker' or 'company'
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                ...profileData
            };

            await this.db.collection('users').doc(user.uid).set(userProfile);
            
            this.currentUser = { ...this.currentUser, ...userProfile, needsProfileSetup: false };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            return { success: true };
        } catch (error) {
            console.error('Error creating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile
    async updateUserProfile(updates) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('No authenticated user');

            updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            
            await this.db.collection('users').doc(user.uid).update(updates);
            
            this.currentUser = { ...this.currentUser, ...updates };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Update UI elements for logged-in user
    updateUIForLoggedInUser() {
        // Update user display name
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.displayName || this.currentUser.email;
        });

        // Update profile photo
        const userPhotoElements = document.querySelectorAll('.user-photo');
        userPhotoElements.forEach(el => {
            if (this.currentUser.photoURL) {
                el.src = this.currentUser.photoURL;
            }
        });

        // Show/hide elements based on role
        if (this.currentUser.role === 'company') {
            document.querySelectorAll('.job-seeker-only').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.company-only').forEach(el => el.style.display = 'block');
        } else {
            document.querySelectorAll('.company-only').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.job-seeker-only').forEach(el => el.style.display = 'block');
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.auth && this.auth.currentUser !== null;
    }

    // Require authentication (call on protected pages)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/static/login.html';
            return false;
        }
        return true;
    }
}

// Create global instance
const authManager = new AuthManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => authManager.initialize());
} else {
    authManager.initialize();
}
