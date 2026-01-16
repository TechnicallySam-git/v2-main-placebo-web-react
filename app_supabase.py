from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash  # noqa: F401 (kept for compatibility if referenced elsewhere)
import os
import base64
import json
from datetime import datetime, timedelta
from uuid import UUID
from dotenv import load_dotenv
import string
import random
import traceback
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# Configure CORS - allow all origins for API Gateway (restrict in production)
FRONTEND_URL = os.getenv('FRONTEND_URL', '*')
CORS(app, origins=['*'], supports_credentials=True)

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
# Prefer explicit service role env var, but SUPABASE_KEY may itself be a legacy service_role JWT
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
_env_supabase_key = os.getenv('SUPABASE_KEY')
SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY or _env_supabase_key  # prefer explicit service role var, else fallback

def _is_service_role_key(key: str | None) -> bool:
    """Return True if the given SUPABASE key appears to be a service_role JWT."""
    if not key:
        return False
    try:
        parts = key.split('.')
        if len(parts) < 2:
            return False
        payload = parts[1]
        padding = '=' * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload + padding)
        obj = json.loads(decoded)
        role = obj.get('role') or ''
        return 'service_role' in str(role)
    except Exception:
        return False

# Treat SUPABASE_KEY as service role when explicit var present or JWT payload indicates service_role
IS_SERVICE_ROLE = bool(SUPABASE_SERVICE_ROLE_KEY) or _is_service_role_key(SUPABASE_KEY)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be set in environment variables")
else:
    print(f"SUPABASE_KEY present. Detected service_role: {IS_SERVICE_ROLE}")

# create supabase client (use SUPABASE_KEY which may be service role)
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
except Exception as e:
    print(f"Failed to create Supabase client: {e}")
    supabase = None

# helper to surface supabase responses
def _resp_error(resp):
    """Return error message if supabase response indicates an error and map permission errors to a helpful hint."""
    try:
        # supabase-py may return object with .error or dict with 'error'
        msg = None
        err = getattr(resp, "error", None)
        if err:
            msg = str(err)
        elif isinstance(resp, dict) and resp.get("error"):
            msg = str(resp.get("error"))
        # some supabase-py responses set .status_code/.status_text or include .data with error info
        elif hasattr(resp, "status_code") and getattr(resp, "status_code") >= 400:
            msg = getattr(resp, "status_text", "") or str(resp)
        else:
            return None

        lower = (msg or "").lower()
        if "permission denied" in lower or "42501" in lower or "service_role" in lower:
            # Make the hint explicit so frontend/devs know what to fix
            return "Database permission denied: this operation requires the Supabase service role key (SUPABASE_SERVICE_ROLE_KEY) or appropriate RLS policies. Set SUPABASE_SERVICE_ROLE_KEY in the server environment or adjust RLS to allow the authenticated role to perform the write."
        return msg
    except Exception:
        return None

# Helper: normalize Supabase auth responses (object or dict shapes)
def _extract_user_id_from_auth_response(resp):
    """Return user_id if present in various supabase-py response shapes."""
    try:
        # object style: resp.user.id
        user = getattr(resp, "user", None)
        if user:
            uid = getattr(user, "id", None)
            if uid:
                return uid

        # dict style: resp.get('data', {}).get('user', {}).get('id')
        if isinstance(resp, dict):
            data = resp.get("data") or resp.get("user") or {}
            if isinstance(data, dict):
                return data.get("user", {}).get("id") or data.get("id")

        # some responses have top-level 'user' key
        if isinstance(resp, dict) and resp.get("user"):
            u = resp["user"]
            if isinstance(u, dict):
                return u.get("id")

    except Exception:
        pass
    return None

def _extract_error_from_auth_response(resp):
    """Return error message if present."""
    try:
        if isinstance(resp, dict):
            for k in ("error", "errors", "message"):
                val = resp.get(k)
                if val:
                    return val
        # object may have .error
        err = getattr(resp, "error", None)
        if err:
            return str(err)
    except Exception:
        pass
    return None

def generate_reward_code():
    """Generate unique reward code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def create_error_response(message, code=400):
    """Create standardized error response"""
    return jsonify({
        "success": False,
        "error": message,
        "timestamp": datetime.now().isoformat()
    }), code

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    try:
        if supabase:
            # Test Supabase connection
            result = supabase.table('user_profile').select("count", count='exact').limit(1).execute()
            db_status = "connected"
        else:
            db_status = "not configured"
        
        return jsonify({
            "status": "ok",
            "message": "Backend is running",
            "database": db_status,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return create_error_response(f"Database connection failed: {str(e)}", 500)





# Login/Register endpoint
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with Supabase Auth"""
    try:
        data = request.get_json()
        if not data:
            return create_error_response("Invalid JSON request", 400)
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        # Validate username
        if not username or len(username) < 2:
            return create_error_response("Username must be at least 2 characters", 400)
        if len(username) > 20:
            return create_error_response("Username must be less than 20 characters", 400)
        
        # Validate email
        if not email or '@' not in email:
            return create_error_response("Valid email is required", 400)
        
        # Validate password
        if not password or len(password) < 6:
            return create_error_response("Password must be at least 6 characters", 400)
        
        # Check if username already exists
        try:
            existing = supabase.table('user_profile').select('username').eq('username', username).execute()
            if existing.data:
                return create_error_response("Username is already taken", 409)
        except Exception:
            pass
        
        # Create new user
        try:
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "username": username,
                        "display_name": username
                    }
                }
            })
            # Log raw auth response for debugging (supports dict or object shapes)
            try:
                print("Supabase sign_up response repr:", repr(auth_response))
                if isinstance(auth_response, dict):
                    print("Supabase sign_up response keys:", list(auth_response.keys()))
                else:
                    # print attributes that may be informative
                    attrs = [a for a in dir(auth_response) if not a.startswith("__")]
                    print("Supabase sign_up response attrs:", attrs)
                    # try common attributes
                    try:
                        user_attr = getattr(auth_response, 'user', None)
                        error_attr = getattr(auth_response, 'error', None)
                        print("auth_response.user:", repr(user_attr))
                        print("auth_response.error:", repr(error_attr))
                    except Exception:
                        print("Could not introspect auth_response details:\n", traceback.format_exc())
            except Exception:
                print("Failed to log auth_response:\n", traceback.format_exc())
            # normalize response (supports supabase-py dict/object shapes)
            user_id = _extract_user_id_from_auth_response(auth_response)
            if not user_id:
                err = _extract_error_from_auth_response(auth_response) or "Registration failed"
                # Map common auth errors to appropriate HTTP codes
                err_str = str(err).lower()
                if "already" in err_str and "email" in err_str:
                    return create_error_response("Email is already registered", 409)
                if "password" in err_str:
                    return create_error_response("Password does not meet requirements", 400)
                return create_error_response(str(err), 500)
             
        except Exception as e:
            error_msg = str(e).lower()
            if "email" in error_msg and "already" in error_msg:
                return create_error_response("Email is already registered", 409)
            elif "password" in error_msg:
                return create_error_response("Password does not meet requirements", 400)
            else:
                print("Registration error:", repr(e))
                # Print full traceback to Lambda/console logs for debugging
                print(traceback.format_exc())
                return create_error_response("Registration failed", 500)
        
        # Get user profile (created by DB trigger)
        try:
            profile = supabase.table('user_profile').select('*').eq('user_id', user_id).single().execute()
            user_data = profile.data
            
            # Fix username if trigger saved it incorrectly
            if user_data.get('username') != username:
                print(f"Fixing username in profile: {user_data.get('username')} -> {username}")
                supabase.table('user_profile').update({'username': username}).eq('user_id', user_id).execute()
                user_data['username'] = username
                
        except Exception as e:
            print(f"Profile fetch error: {e}")
            print(f"Profile fetch error type: {type(e).__name__}")
            print(f"Profile fetch error details: {e.__dict__ if hasattr(e, '__dict__') else 'N/A'}")
            
            # Fallback: create profile if trigger didn't work
            try:
                profile_insert = supabase.table('user_profile').insert({
                    'user_id': user_id,
                    'username': username,
                    'current_points': 1000,
                    'user_status': 'active'
                }).execute()
                
                # Check for errors
                err = _resp_error(profile_insert)
                if err:
                    print(f"Profile insert returned error: {err}")
                    return create_error_response(f"Profile creation failed: {err}", 500)
                
                if not profile_insert.data:
                    print("Profile insert returned no data")
                    return create_error_response("Profile creation returned no data", 500)
                    
                user_data = profile_insert.data[0]
                
            except Exception as e2:
                print(f"Profile creation error: {e2}")
                print(f"Profile creation error type: {type(e2).__name__}")
                print(f"Profile creation error dict: {e2.__dict__ if hasattr(e2, '__dict__') else 'N/A'}")
                
                # Try to extract more details
                error_msg = str(e2)
                if hasattr(e2, 'message'):
                    error_msg = e2.message
                if hasattr(e2, 'code'):
                    error_msg = f"{error_msg} (code: {e2.code})"
                    
                return create_error_response(f"Registration completed but profile creation failed: {error_msg}", 500)
        
        # Create JWT token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            "success": True,
            "user": {
                "id": user_id,
                "name": username,
                "points": user_data.get('current_points', 1000),
                "totalPoints": user_data.get('current_points', 1000),
                "status": user_data.get('user_status', 'active'),
                "createdAt": user_data.get('created_at'),
                "lastLogin": user_data.get('updated_at')
            },
            "isFirstLogin": True,
            "access_token": access_token,
            "timestamp": datetime.now().isoformat()
        }), 201
        
    except Exception as e:
        print(f"Unexpected registration error: {e}")
        return create_error_response("Registration failed", 500)

# Login endpoint
@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user with Supabase Auth"""
    try:
        data = request.get_json()
        if not data:
            return create_error_response("Invalid JSON request", 400)
        
        # Support both email and username login
        identifier = data.get('email', '').strip() or data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not identifier:
            return create_error_response("Email or username is required", 400)
        if not password:
            return create_error_response("Password is required", 400)
        
        # Determine if identifier is email or username
        email = identifier
        if '@' not in identifier:
            # Look up username in user_profile, fallback to display_name in auth
            try:
                print(f"Looking up username: {identifier}")
                profile = supabase.table('user_profile').select('user_id').eq('username', identifier).execute()
                print(f"Profile lookup result: {profile.data}")
                
                if not profile.data or len(profile.data) == 0:
                    print("No profile data found for username, trying to find by display_name in auth")
                    # Fallback: user_profile might have wrong username, search by display_name in auth
                    try:
                        users_response = supabase.auth.admin.list_users()
                        users = users_response if isinstance(users_response, list) else getattr(users_response, 'users', [])
                        
                        for user in users:
                            display_name = getattr(user, 'user_metadata', {}).get('display_name', '') if hasattr(user, 'user_metadata') else user.get('user_metadata', {}).get('display_name', '')
                            if display_name == identifier:
                                email = getattr(user, 'email', None) if hasattr(user, 'email') else user.get('email')
                                user_id_from_auth = getattr(user, 'id', None) if hasattr(user, 'id') else user.get('id')
                                print(f"Found user by display_name: {email}")
                                
                                # Update user_profile with correct username
                                try:
                                    supabase.table('user_profile').update({'username': identifier}).eq('user_id', user_id_from_auth).execute()
                                    print(f"Updated user_profile with correct username")
                                except:
                                    pass
                                break
                        else:
                            return create_error_response("Invalid credentials", 401)
                    except Exception as e2:
                        print(f"Display name lookup error: {e2}")
                        return create_error_response("Invalid credentials", 401)
                else:
                    user_id_from_profile = profile.data[0].get('user_id')
                    if not user_id_from_profile:
                        print("User ID not found in profile")
                        return create_error_response("Invalid credentials", 401)
                    
                    # Get email from auth.users table using admin API
                    print(f"Looking up auth user for user_id: {user_id_from_profile}")
                    auth_user = supabase.auth.admin.get_user_by_id(user_id_from_profile)
                    email = auth_user.user.email
                    
                    if not email:
                        print("Email not found in auth user")
                        return create_error_response("Invalid credentials", 401)
                        
                    print(f"Found email for username: {email}")
            except Exception as e:
                print(f"Username lookup error: {e}")
                return create_error_response("Invalid credentials", 401)
        
        # Sign in with Supabase Auth (checks auth.users table)
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            # normalize response
            user_id = _extract_user_id_from_auth_response(auth_response)
            if not user_id:
                err = _extract_error_from_auth_response(auth_response)
                # Return 401 for invalid credentials, map other messages where possible
                if err:
                    err_l = str(err).lower()
                    if "email not confirmed" in err_l:
                        return create_error_response("Please confirm your email", 403)
                    if "too many" in err_l:
                        return create_error_response("Too many attempts - try again later", 429)
                    # Generic auth failure -> 401
                    return create_error_response(str(err), 401)
                return create_error_response("Invalid credentials", 401)
         
        except Exception as e:
            error_msg = str(e).lower()
            if "invalid" in error_msg or "credentials" in error_msg:
                return create_error_response("Invalid credentials", 401)
            elif "email not confirmed" in error_msg:
                return create_error_response("Please confirm your email", 403)
            elif "too many" in error_msg:
                return create_error_response("Too many attempts - try again later", 429)
            else:
                print(f"Login error: {e}")
                return create_error_response("Login failed", 500)
        
        # Get user profile from user_profile table
        try:
            profile = supabase.table('user_profile').select('*').eq('user_id', user_id).single().execute()
            user_data = profile.data
            username = user_data.get('username', 'User')
        except Exception as e:
            print(f"Profile fetch error: {e}")
            return create_error_response("User profile not found", 404)
        
        # Update last login
        try:
            supabase.table('user_profile').update({
                'updated_at': datetime.now().isoformat()
            }).eq('user_id', user_id).execute()
        except Exception:
            pass  # Non-critical
        
        # Create JWT token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            "success": True,
            "user": {
                "id": user_id,
                "name": username,
                "points": user_data.get('current_points', 0),
                "totalPoints": user_data.get('current_points', 0),
                "status": user_data.get('user_status', 'active'),
                "createdAt": user_data.get('created_at'),
                "lastLogin": user_data.get('updated_at')
            },
            "isFirstLogin": False,
            "access_token": access_token,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Unexpected login error: {e}")
        return create_error_response("Login failed", 500)

# Logout endpoint
@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    user_id = get_jwt_identity()
    
    try:
        supabase.auth.sign_out()
    except:
        pass  # Best effort sign out
    
    return jsonify({"success": True})

# Get user data
@app.route('/api/user/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user data"""
    current_user = get_jwt_identity()
    if current_user != user_id:
        return create_error_response("Unauthorized", 401)
    
    try:
        # Get user profile
        profile = supabase.table('user_profile').select('*').eq('user_id', user_id).single().execute()
        user_data = profile.data
        
        # Get auth user for username
        auth_user = supabase.auth.admin.get_user_by_id(user_id)
        username = auth_user.user.user_metadata.get('username', 'User')
        
        return jsonify({
            "id": user_id,
            "name": username,
            "points": user_data.get('current_points', 0),
            "status": user_data.get('user_status', 'active'),
            "createdAt": user_data.get('created_at'),
            "lastLogin": user_data.get('updated_at')
        })
        
    except Exception as e:
        print(f"Get user error: {e}")
        return create_error_response("User not found", 404)

# Update user points (after game)
@app.route('/api/user/<user_id>/points', methods=['PUT'])
@jwt_required()
def update_points(user_id):
    """Update user points after game with transaction"""
    current_user = get_jwt_identity()
    if current_user != user_id:
        return create_error_response("Unauthorized", 401)

    # Ensure supabase client exists; don't preemptively require service role so we can surface DB errors
    if not supabase:
        return create_error_response("Server misconfiguration: SUPABASE_URL and SUPABASE_KEY must be set", 503)

    try:
        data = request.get_json()
        if not data:
            return create_error_response("Invalid JSON request", 400)
        
        round_id = data.get('round_id')
        points_change = data.get('points_change', 0)
        
        if not round_id:
            return create_error_response("round_id is required", 400)
        
        profile = supabase.table('user_profile').select('current_points').eq('user_id', user_id).single().execute()
        err = _resp_error(profile)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        current_points = profile.data['current_points']

        new_balance = max(0, current_points + points_change)
        
        upd = supabase.table('user_profile').update({
            'current_points': new_balance,
            'updated_at': datetime.now().isoformat()
        }).eq('user_id', user_id).execute()
        err = _resp_error(upd)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        updated_profile = supabase.table('user_profile').select('*').eq('user_id', user_id).single().execute()
        err = _resp_error(updated_profile)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        return jsonify({
            "success": True,
            "points": new_balance,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Update points error: {e}")
        return create_error_response(f"Failed to update points: {str(e)}", 500)

# Get game history
@app.route('/api/user/<user_id>/history', methods=['GET'])
@jwt_required()
def get_history(user_id):
    """Get user game history with pagination"""
    current_user = get_jwt_identity()
    if current_user != user_id:
        return create_error_response("Unauthorized", 401)
    
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Get rounds with game info
        result = supabase.table('round').select(
            'round_id, played_at, points_used, round_result, points_change, balance_after, round_data, game:game_id(game_name, game_type)'
        ).eq('user_id', user_id).order('played_at', desc=True).range(offset, offset + limit - 1).execute()
        
        rounds = result.data
        
        # Get total count
        count_result = supabase.table('round').select('*', count='exact').eq('user_id', user_id).execute()
        total = count_result.count
        
        # Format history
        game_history = []
        for round_data in rounds:
            game_history.append({
                "gameName": round_data.get('game', {}).get('game_name', 'Unknown'),
                "gameType": round_data.get('game', {}).get('game_type', 'unknown'),
                "result": round_data.get('round_result'),
                "pointsChange": round_data.get('points_change'),
                "newBalance": round_data.get('balance_after'),
                "timestamp": round_data.get('played_at')
            })
        
        return jsonify({
            "success": True,
            "gameHistory": game_history,
            "total": total,
            "limit": limit,
            "offset": offset,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Get history error: {e}")
        return create_error_response(f"Failed to retrieve game history: {str(e)}", 500)

# Get all users (for leaderboard)
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users for leaderboard (public endpoint)"""
    try:
        limit = request.args.get('limit', 100, type=int)
        
        # Get top users by points
        result = supabase.table('user_profile').select(
            'user_id, current_points, created_at'
        ).eq('user_status', 'active').order('current_points', desc=True).limit(limit).execute()
        
        users = result.data
        
        # Get usernames from auth
        user_list = []
        for user in users:
            try:
                auth_user = supabase.auth.admin.get_user_by_id(user['user_id'])
                username = auth_user.user.user_metadata.get('username', 'User')
                
                # Get games played count
                rounds = supabase.table('round').select('*', count='exact').eq('user_id', user['user_id']).execute()
                
                user_list.append({
                    "name": username,
                    "points": user.get('current_points', 0),
                    "totalPoints": user.get('current_points', 0),
                    "gamesPlayed": rounds.count
                })
            except:
                continue
        
        return jsonify({
            "success": True,
            "users": user_list,
            "total": len(user_list),
            "limit": limit,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Get users error: {e}")
        return create_error_response(f"Failed to retrieve users: {str(e)}", 500)

# Get user stats
@app.route('/api/user/<user_id>/stats', methods=['GET'])
def get_stats(user_id):
    """Get user statistics (public endpoint)"""
    try:
        # Get user profile
        profile = supabase.table('user_profile').select('*').eq('user_id', user_id).single().execute()
        user_data = profile.data
        
        # Get rounds
        rounds = supabase.table('round').select('round_result, points_change').eq('user_id', user_id).execute()
        history = rounds.data
        
        # Get username
        try:
            auth_user = supabase.auth.admin.get_user_by_id(user_id)
            username = auth_user.user.user_metadata.get('username', 'User')
        except:
            username = 'User'
        
        # Calculate stats
        wins = sum(1 for r in history if r.get('round_result') in ['win', 'blackjack'])
        losses = sum(1 for r in history if r.get('round_result') == 'loss')
        total_points_won = sum(r.get('points_change', 0) for r in history if r.get('points_change', 0) > 0)
        total_points_lost = sum(abs(r.get('points_change', 0)) for r in history if r.get('points_change', 0) < 0)
        
        stats = {
            "username": username,
            "currentPoints": user_data.get('current_points', 0),
            "totalPoints": user_data.get('current_points', 0),
            "gamesPlayed": len(history),
            "wins": wins,
            "losses": losses,
            "winRate": (wins / len(history) * 100) if history else 0,
            "totalPointsWon": total_points_won,
            "totalPointsLost": total_points_lost,
            "createdAt": user_data.get('created_at'),
            "lastLogin": user_data.get('updated_at')
        }
        
        return jsonify({
            "success": True,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Get stats error: {e}")
        return create_error_response(f"Failed to retrieve stats: {str(e)}", 500)

# Reward codes - Generate
@app.route('/api/rewards/generate', methods=['POST'])
@jwt_required()
def generate_reward():
    """Generate reward code (admin endpoint)"""
    # Require service role key for writes
    if not supabase or not IS_SERVICE_ROLE:
        return create_error_response("Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing or DB not configured", 503)

    try:
        data = request.get_json()
        if not data:
            return create_error_response("Invalid JSON request", 400)
        
        points = data.get('points', 100)
        
        if not isinstance(points, int) or points <= 0:
            return create_error_response("Points must be positive integer", 400)
        
        # Create reward in database
        code = generate_reward_code()
        
        result = supabase.table('reward').insert({
            'reward_name': f'Bonus Code {code}',
            'reward_description': f'{points} bonus points',
            'reward_type': 'gift_card',
            'point_cost': 0,
            'point_amount': points,
            'is_active': True,
            'quantity_in_stock': 1
        }).execute()
        err = _resp_error(result)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        reward_id = result.data[0]['reward_id']
        
        return jsonify({
            "success": True,
            "code": code,
            "reward_id": reward_id,
            "points": points,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Generate reward error: {e}")
        return create_error_response(f"Failed to generate reward code: {str(e)}", 500)

# Reward codes - Redeem
@app.route('/api/rewards/redeem', methods=['POST'])
@jwt_required()
def redeem_reward():
    """Redeem reward code"""
    current_user = get_jwt_identity()
    
    # Require service role key for writes
    if not supabase or not IS_SERVICE_ROLE:
        return create_error_response("Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing or DB not configured", 503)

    try:
        data = request.get_json()
        if not data:
            return create_error_response("Invalid JSON request", 400)
        
        user_id = data.get('user_id')
        code = data.get('code', '').upper()
        
        if user_id != current_user:
            return create_error_response("Unauthorized", 401)
        
        if not user_id or not code:
            return create_error_response("user_id and code required", 400)
        
        # Find reward by code (in reward_name or description)
        rewards = supabase.table('reward').select('*').ilike('reward_name', f'%{code}%').eq('is_active', True).execute()
        err = _resp_error(rewards)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        if not rewards.data:
            return create_error_response("Invalid reward code", 400)
        
        reward = rewards.data[0]
        
        # Check if already redeemed
        existing = supabase.table('reward_redemption').select('*').eq('user_id', user_id).eq('reward_id', reward['reward_id']).execute()
        err = _resp_error(existing)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        if existing.data:
            return create_error_response("You already used this code", 400)
        
        # Check stock
        if reward.get('quantity_in_stock', 0) <= 0:
            return create_error_response("Reward code has no uses left", 400)
        
        # Get current points
        profile = supabase.table('user_profile').select('current_points').eq('user_id', user_id).single().execute()
        err = _resp_error(profile)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        current_points = profile.data['current_points']
        
        # Add points
        points_to_add = reward.get('point_amount', 0)
        new_balance = current_points + points_to_add
        
        # Create redemption
        redemption = supabase.table('reward_redemption').insert({
            'user_id': user_id,
            'reward_id': reward['reward_id'],
            'points_spent': 0,
            'redemption_code': code,
            'redemption_status': 'issued'
        }).execute()
        err = _resp_error(redemption)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        redemption_id = redemption.data[0]['redemption_id']
        
        # Create point transaction
        pt = supabase.table('point_transaction').insert({
            'user_id': user_id,
            'transaction_type': 'REDEEM_REWARD',
            'transaction_change': points_to_add,
            'balance_after': new_balance,
            'redemption_id': redemption_id,
            'description': f'Redeemed code {code}'
        }).execute()
        err = _resp_error(pt)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        # Update user points
        upd = supabase.table('user_profile').update({
            'current_points': new_balance,
            'updated_at': datetime.now().isoformat()
        }).eq('user_id', user_id).execute()
        err = _resp_error(upd)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        # Decrement stock
        dec = supabase.table('reward').update({
            'quantity_in_stock': reward['quantity_in_stock'] - 1
        }).eq('reward_id', reward['reward_id']).execute()
        err = _resp_error(dec)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        return jsonify({
            "success": True,
            "pointsAdded": points_to_add,
            "newBalance": new_balance,
            "message": f"Reward code redeemed! +{points_to_add} points",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Redeem reward error: {e}")
        return create_error_response(f"Failed to redeem reward code: {str(e)}", 500)

# Create game round
@app.route('/api/game/round', methods=['POST'])
@jwt_required()
def create_round():
    """Create a new game round"""
    current_user = get_jwt_identity()
    
    # Require service role key for writes
    if not supabase or not IS_SERVICE_ROLE:
        return create_error_response("Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY missing or DB not configured", 503)
    
    try:
        data = request.get_json()
        if not data:
            return create_error_response("Invalid JSON request", 400)
        
        user_id = data.get('user_id')
        game_id = data.get('game_id')
        points_used = data.get('points_used', 0)
        round_result = data.get('result', 'loss')
        points_change = data.get('points_change', 0)
        round_data = data.get('round_data', {})
        
        if user_id != current_user:
            return create_error_response("Unauthorized", 401)
        
        # Get current points
        profile = supabase.table('user_profile').select('current_points').eq('user_id', user_id).single().execute()
        err = _resp_error(profile)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        current_points = profile.data['current_points']

        # Resolve game_id: if client sent a non-UUID (e.g. 'blackjack' or game name), look up the game row
        resolved_game_id = game_id
        min_bet_points = None
        if game_id:
            try:
                UUID(str(game_id))
            except Exception:
                try:
                    # Try to find game by exact name first
                    game_row = supabase.table('game').select('*').eq('game_name', game_id).execute()
                    err = _resp_error(game_row)
                    if err:
                        return create_error_response(f"Database error: {err}", 500)
                    if not game_row.data:
                        # Fallback to searching by game_type
                        game_row = supabase.table('game').select('*').eq('game_type', game_id).execute()
                        err = _resp_error(game_row)
                        if err:
                            return create_error_response(f"Database error: {err}", 500)
                    if not game_row.data:
                        return create_error_response("Invalid game_id", 400)
                    resolved_game_id = game_row.data[0]['game_id']
                    min_bet_points = game_row.data[0].get('min_bet_points', None)
                except Exception as e:
                    print(f"Game lookup error: {e}")
                    return create_error_response("Invalid game_id", 400)

        # Ensure points_used meets game minimums and DB constraints
        try:
            points_used = int(points_used or 0)
        except Exception:
            points_used = 0

        if (not points_used or points_used <= 0) and min_bet_points:
            points_used = int(min_bet_points)

        if points_used <= 0:
            return create_error_response("points_used must be a positive integer", 400)

        # Calculate new balance
        new_balance = max(0, current_points + points_change)

        # Create round
        round_insert = supabase.table('round').insert({
            'user_id': user_id,
            'game_id': resolved_game_id,
            'points_used': points_used,
            'round_result': round_result,
            'points_change': points_change,
            'balance_after': new_balance,
            'round_data': round_data
        }).execute()
        err = _resp_error(round_insert)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        round_id = round_insert.data[0]['round_id']
        
        # Create point transaction
        transaction_type = {
            'win': 'GAME_WIN',
            'loss': 'GAME_LOSS',
            'push': 'GAME_PUSH',
            'blackjack': 'BLACKJACK'
        }.get(round_result, 'GAME_LOSS')
        
        pt = supabase.table('point_transaction').insert({
            'user_id': user_id,
            'transaction_type': transaction_type,
            'transaction_change': points_change,
            'balance_after': new_balance,
            'round_id': round_id,
            'description': f'{round_result.capitalize()} - {points_used} points bet'
        }).execute()
        err = _resp_error(pt)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        # Update user points
        upd = supabase.table('user_profile').update({
            'current_points': new_balance,
            'updated_at': datetime.now().isoformat()
        }).eq('user_id', user_id).execute()
        err = _resp_error(upd)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        
        return jsonify({
            "success": True,
            "round_id": round_id,
            "new_balance": new_balance,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Create round error: {e}")
        return create_error_response(f"Failed to create round: {str(e)}", 500)

# Get available games
@app.route('/api/games', methods=['GET'])
def get_games():
    """Get available games"""
    try:
        if not supabase:
            return create_error_response("Database not configured", 503)

        result = supabase.table('game').select('*').eq('game_status', 'waiting').execute()
        err = _resp_error(result)
        if err:
            return create_error_response(f"Database error: {err}", 500)
        games = result.data
        
        return jsonify({
            "success": True,
            "games": games,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Get games error: {e}")
        return create_error_response(f"Failed to retrieve games: {str(e)}", 500)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return create_error_response("Endpoint not found", 404)

@app.errorhandler(500)
def server_error(error):
    return create_error_response("Internal server error", 500)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
