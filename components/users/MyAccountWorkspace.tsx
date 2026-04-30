import React, { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/Select";
import { Upload, Loader2, KeyRound, User as UserIcon, Eye, EyeOff, Shield, Info, BookOpen, Users, BarChart2 } from "../icons";
import { useToast } from "../../hooks/useToast";
import { SCHOOLS_BY_PROVINCE, PROFESSIONAL_GROUPS } from "../../constants";
import { Badge } from "../ui/Badge";
import { User } from "../../types";

// Component for Usage Statistics
const UsageStatisticsCard: React.FC<{ currentUser: User }> = ({ currentUser }) => (
    <Card className="shadow-lg border-none bg-white dark:bg-gray-900">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5"/>Thống kê sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Số lần đăng nhập</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{currentUser.usageCount}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Tổng số token đã dùng</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(currentUser.tokenUsage || 0).toLocaleString('vi-VN')}</p>
            </div>
        </CardContent>
    </Card>
);

// Component for Profile Information
const ProfileInformationCard: React.FC<{
    currentUser: User;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    users: User[];
}> = ({ currentUser, setCurrentUser, users }) => {
    const { addToast } = useToast();
    const [profileData, setProfileData] = useState({
        name: currentUser.name,
        username: currentUser.username,
        school: currentUser.school,
        profGroup: currentUser.profGroup,
        avatar: currentUser.avatar,
    });
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setProfileData({
            name: currentUser.name,
            username: currentUser.username,
            school: currentUser.school,
            profGroup: currentUser.profGroup,
            avatar: currentUser.avatar,
        });
    }, [currentUser]);

    const allSchools = useMemo(() => {
        const schools = Object.values(SCHOOLS_BY_PROVINCE).flat();
        return [...new Set(schools)].sort((a, b) => a.localeCompare(b, 'vi'));
    }, []);

    const allProfessionalGroups = useMemo(() => {
        const allGroups = Object.values(PROFESSIONAL_GROUPS).flat();
        return [...new Set(allGroups)].sort((a, b) => a.localeCompare(b, 'vi'));
    }, []);

    const handleProfileChange = (field: string, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (file: File | null) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            addToast("Lỗi: Kích thước file không được vượt quá 5MB.");
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            addToast("Lỗi: Chỉ chấp nhận file ảnh định dạng .jpg hoặc .png.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isOver);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };
    
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileData.name.trim()) {
            addToast("Lỗi: Họ và tên không được để trống.");
            return;
        }
        if (!profileData.username.trim()) {
            addToast("Lỗi: Tên đăng nhập không được để trống.");
            return;
        }
        if (users.some(u => u.username.toLowerCase() === profileData.username.toLowerCase() && u.id !== currentUser.id)) {
            addToast("Lỗi: Tên đăng nhập này đã tồn tại.");
            return;
        }
        const usernameChanged = profileData.username !== currentUser.username;
        if (usernameChanged && !passwordConfirm) {
            addToast("Lỗi: Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi tên đăng nhập.");
            return;
        }
        if (usernameChanged && passwordConfirm !== currentUser.password) {
            addToast("Lỗi: Mật khẩu xác nhận không đúng.");
            return;
        }
        
        setIsSavingProfile(true);
        await new Promise(resolve => setTimeout(resolve, 700));
        
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                ...profileData
            };
        });
        addToast("Đã cập nhật thông tin tài khoản thành công!");
        setIsSavingProfile(false);
        setPasswordConfirm('');
    };
    
    const usernameChanged = profileData.username !== currentUser.username;

    return (
        <Card className="shadow-lg border-none bg-white dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserIcon className="w-5 h-5"/>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div
                            onDragOver={(e) => handleDragEvents(e, true)}
                            onDragLeave={(e) => handleDragEvents(e, false)}
                            onDrop={handleDrop}
                            className={`relative w-32 h-32 rounded-full group cursor-pointer border-2 border-dashed flex-shrink-0
                                ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-8 h-8" />
                                <span className="text-sm mt-1">Thả file</span>
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                Thay đổi ảnh đại diện
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                                accept="image/png, image/jpeg, image/jpg"
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG. Tối đa 5MB.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="flex items-center gap-2"><UserIcon size={16} className="text-blue-500"/>Họ và tên</Label>
                            <Input id="name" value={profileData.name} onChange={e => handleProfileChange('name', e.target.value)} required />
                        </div>
                         <div className="space-y-1.5">
                            <Label htmlFor="username" className="flex items-center gap-2"><UserIcon size={16} className="text-indigo-500"/>Tên đăng nhập</Label>
                            <Input id="username" value={profileData.username} onChange={e => handleProfileChange('username', e.target.value)} required />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="email" className="flex items-center gap-2"><Info size={16} className="text-gray-500"/>Email đăng nhập</Label>
                            <Input id="email" type="email" value={currentUser.email} readOnly disabled className="cursor-not-allowed bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="role" className="flex items-center gap-2"><Shield size={16} className="text-red-500"/>Vai trò</Label>
                            <div><Badge variant={currentUser.role === 'Quản trị hệ thống' ? 'danger' : 'info'}>{currentUser.role}</Badge></div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="status" className="flex items-center gap-2"><Info size={16} className="text-green-500"/>Trạng thái</Label>
                            <div><Badge variant={currentUser.status === 'Hoạt động' ? 'success' : 'warning'}>{currentUser.status}</Badge></div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="school" className="flex items-center gap-2"><BookOpen size={16} className="text-purple-500"/>Đơn vị/Trường</Label>
                            <Select onValueChange={value => handleProfileChange('school', value)} value={profileData.school}>
                                <SelectTrigger><SelectValue placeholder="Chọn trường" /></SelectTrigger>
                                <SelectContent>
                                    {allSchools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="profGroup" className="flex items-center gap-2"><Users size={16} className="text-teal-500"/>Tổ chuyên môn</Label>
                            <Select onValueChange={value => handleProfileChange('profGroup', value)} value={profileData.profGroup}>
                                <SelectTrigger><SelectValue placeholder="Chọn tổ chuyên môn" /></SelectTrigger>
                                <SelectContent>
                                    {allProfessionalGroups.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         {usernameChanged && (
                            <div className="space-y-1.5 md:col-span-2 mt-4 pt-4 border-t border-dashed border-yellow-400">
                                <Label htmlFor="passwordConfirm" className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                                    <Shield size={16} /> Xác nhận mật khẩu để đổi Tên đăng nhập
                                </Label>
                                <Input 
                                    id="passwordConfirm" 
                                    type="password"
                                    placeholder="Nhập mật khẩu hiện tại của bạn"
                                    value={passwordConfirm} 
                                    onChange={e => setPasswordConfirm(e.target.value)} 
                                    required 
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => {
                        setProfileData({ name: currentUser.name, username: currentUser.username, school: currentUser.school, profGroup: currentUser.profGroup, avatar: currentUser.avatar });
                        setPasswordConfirm('');
                    }} disabled={isSavingProfile}>Hủy</Button>
                    <Button type="submit" disabled={isSavingProfile}>
                        {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </Card>
    );
};

// Component for Password & Security
const PasswordSecurityCard: React.FC<{
    currentUser: User;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}> = ({ currentUser, setCurrentUser }) => {
    const { addToast } = useToast();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
    };

    const toggleShowPassword = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.currentPassword !== currentUser.password) {
            addToast("Lỗi: Mật khẩu hiện tại không đúng.");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            addToast("Lỗi: Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast("Lỗi: Mật khẩu mới không khớp.");
            return;
        }
        setIsSavingPassword(true);
        await new Promise(resolve => setTimeout(resolve, 700));

        setCurrentUser(prev => prev ? ({ ...prev, password: passwordData.newPassword }) : null);

        addToast("Đã thay đổi mật khẩu thành công!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsSavingPassword(false);
    };

    return (
        <Card className="shadow-lg border-none bg-white dark:bg-gray-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5"/>Bảo mật & Mật khẩu</CardTitle>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5 relative">
                        <Label htmlFor="current-password" className="flex items-center gap-2"><KeyRound size={16} className="text-orange-500"/>Mật khẩu hiện tại</Label>
                        <Input id="current-password" type={showPasswords.current ? 'text' : 'password'} value={passwordData.currentPassword} onChange={e => handlePasswordChange('currentPassword', e.target.value)} required />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-7" onClick={() => toggleShowPassword('current')}>
                           {showPasswords.current ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 relative">
                            <Label htmlFor="new-password" className="flex items-center gap-2"><KeyRound size={16} className="text-green-500"/>Mật khẩu mới</Label>
                            <Input id="new-password" type={showPasswords.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={e => handlePasswordChange('newPassword', e.target.value)} required />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-7" onClick={() => toggleShowPassword('new')}>
                                {showPasswords.new ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </Button>
                        </div>
                        <div className="space-y-1.5 relative">
                            <Label htmlFor="confirm-password" className="flex items-center gap-2"><KeyRound size={16} className="text-green-500"/>Xác nhận mật khẩu mới</Label>
                            <Input id="confirm-password" type={showPasswords.confirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={e => handlePasswordChange('confirmPassword', e.target.value)} required />
                             <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-7" onClick={() => toggleShowPassword('confirm')}>
                                {showPasswords.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end gap-2">
                     <Button type="submit" disabled={isSavingPassword}>
                        {isSavingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Cập nhật mật khẩu
                    </Button>
                </div>
            </form>
        </Card>
    );
};

// Main Component
interface MyAccountWorkspaceProps {
    currentUser: User;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    users: User[];
}

export default function MyAccountWorkspace({ currentUser, setCurrentUser, users }: MyAccountWorkspaceProps) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Tài khoản của tôi
            </h2>
            <UsageStatisticsCard currentUser={currentUser} />
            <ProfileInformationCard currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} />
            <PasswordSecurityCard currentUser={currentUser} setCurrentUser={setCurrentUser} />
        </div>
    );
}