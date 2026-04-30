import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/Select";
import { Checkbox } from "../ui/Checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { Users, Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Edit, Trash2, Lock, Unlock, KeyRound, XCircle, Upload, Loader2, FolderCog, Zap, User as UserIcon, Info, Shield, BookOpen } from "../icons";
import { useToast } from "../../hooks/useToast";
import { User } from "../../types";
import { PROFESSIONAL_GROUPS, SCHOOLS_BY_PROVINCE } from "../../constants";
import { SelectWithOther } from '../ui/SelectWithOther';

const DEFAULT_ITEMS_PER_PAGE = 10;
const FILTERS_STORAGE_KEY = 'form_user_management_filters';

interface UserManagementWorkspaceProps {
    users: User[];
    setUsers: (users: User[] | ((prevUsers: User[]) => User[])) => void;
    currentUser: User;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function UserManagementWorkspace({ users, setUsers, currentUser, setCurrentUser }: UserManagementWorkspaceProps) {
    const { addToast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
    const [modalState, setModalState] = useState<{ mode: 'add' | 'edit' | null; user?: User }>({ mode: null });
    const [itemsToDelete, setItemsToDelete] = useState<{ users: User[], ids: number[] } | null>(null);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
    const [isBulkRoleModalOpen, setIsBulkRoleModalOpen] = useState(false);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'ascending' | 'descending' } | null>(null);
    const [recentlyModifiedId, setRecentlyModifiedId] = useState<number | null>(null);

    const allSchools = useMemo(() => {
        const schools = Object.values(SCHOOLS_BY_PROVINCE).flat();
        return [...new Set(schools)].sort((a, b) => a.localeCompare(b, 'vi'));
    }, []);

    const allProfessionalGroups = useMemo(() => {
        const allGroups = Object.values(PROFESSIONAL_GROUPS).flat();
        return [...new Set(allGroups)].sort((a, b) => a.localeCompare(b, 'vi'));
    }, []);

    const [searchInputValue, setSearchInputValue] = useState(() => {
        try {
            const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
            return saved ? JSON.parse(saved).searchQuery : '';
        } catch (e) { return ''; }
    });

    const [filters, setFilters] = useState(() => {
        try {
            const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : {};
            return {
                searchQuery: parsed.searchQuery || '',
                roleFilter: parsed.roleFilter || 'all',
                statusFilter: parsed.statusFilter || 'all'
            };
        } catch (e) {
            return { searchQuery: '', roleFilter: 'all', statusFilter: 'all' };
        }
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
    
    useEffect(() => {
        if (recentlyModifiedId) {
            const timer = setTimeout(() => {
                setRecentlyModifiedId(null);
            }, 3000); // Highlight for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [recentlyModifiedId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    }, [filters]);
    
    const handleSearch = () => {
        setFilters(prev => ({...prev, searchQuery: searchInputValue}));
        setCurrentPage(1);
    }

    const handleClearSearch = () => {
        setSearchInputValue('');
        setFilters(prev => ({...prev, searchQuery: ''}));
        setCurrentPage(1);
    }

    const requestSort = (key: keyof User) => {
        if (sortConfig && sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                setSortConfig({ key, direction: 'descending' });
            } else {
                setSortConfig(null); // Clear sort on third click
            }
        } else {
            setSortConfig({ key, direction: 'ascending' });
        }
        setCurrentPage(1); // Reset to first page on sort
    };

    const handleSelectFilterChange = (filterName: 'roleFilter' | 'statusFilter', value: string) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchLower = filters.searchQuery.toLowerCase();
            const matchesSearch = user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower) || user.username.toLowerCase().includes(searchLower);
            const matchesRole = filters.roleFilter === 'all' || user.role === filters.roleFilter;
            const matchesStatus = filters.statusFilter === 'all' || user.status === filters.statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [filters, users]);

    const sortedUsers = useMemo(() => {
        const sortableUsers = [...filteredUsers];
        sortableUsers.sort((a, b) => {
            if (a.role === 'Quản trị hệ thống' && b.role !== 'Quản trị hệ thống') return -1;
            if (a.role !== 'Quản trị hệ thống' && b.role === 'Quản trị hệ thống') return 1;
            if (sortConfig) {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const comparison = aValue.localeCompare(bValue, 'vi');
                    if (comparison !== 0) return sortConfig.direction === 'ascending' ? comparison : -comparison;
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return a.id - b.id;
        });
        return sortableUsers;
    }, [filteredUsers, sortConfig]);

    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const handleSelect = (userId: number, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(userId);
        else newSet.delete(userId);
        setSelectedIds(newSet);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(new Set(paginatedUsers.map(u => u.id)));
        else setSelectedIds(new Set());
    };

    const handleSaveUser = async (userData: Partial<User>, id?: number) => {
        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call

        const typedUserData = {
            ...userData,
            role: userData.role as User['role'],
            status: userData.status as User['status'],
        };
    
        if (id) { // Edit mode
            if (id === currentUser.id) {
                setCurrentUser(prevUser => {
                    if (!prevUser) return null;
                    return { ...prevUser, ...typedUserData };
                });
            } else {
                setUsers(prevUsers => prevUsers.map(u => u.id === id ? { ...u, ...typedUserData } : u));
            }
            setRecentlyModifiedId(id);
            addToast(`Đã cập nhật người dùng ${typedUserData.name}.`);
        } else { // Add mode
            const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
            const newUser: User = {
                id: newId,
                name: typedUserData.name || 'Người dùng mới',
                username: typedUserData.username || `user${Date.now()}`,
                email: typedUserData.email || '',
                password: typedUserData.password,
                role: typedUserData.role || 'Giáo viên',
                school: typedUserData.school || '',
                profGroup: typedUserData.profGroup || '',
                status: 'Hoạt động',
                lastLogin: '',
                avatar: typedUserData.avatar || `https://i.pravatar.cc/150?u=${newId}`,
                usageCount: 0,
                tokenUsage: 0,
                usageLimit: typedUserData.usageLimit || 5,
            };
            setUsers(prevUsers => [newUser, ...prevUsers]);
            setRecentlyModifiedId(newId);
            addToast(`Đã thêm người dùng ${newUser.name}.`);
        }
        setModalState({ mode: null });
    };

    const handleToggleStatus = (user: User) => {
        if (user.id === currentUser.id) {
            addToast("Lỗi: Bạn không thể tự khóa tài khoản của mình.");
            setOpenActionMenuId(null);
            return;
        }
        const newStatus: User['status'] = user.status === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
        const updatedUser = { ...user, status: newStatus };

        setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
        setRecentlyModifiedId(user.id);
        
        addToast(`Đã ${newStatus === 'Hoạt động' ? 'kích hoạt' : 'tạm khóa'} tài khoản ${user.name}.`);
        setOpenActionMenuId(null);
    };
    
    const handleToggleRole = (user: User) => {
        if (user.id === currentUser.id) {
            addToast("Lỗi: Bạn không thể tự thay đổi vai trò của mình.");
            setOpenActionMenuId(null);
            return;
        }

        const adminUsers = users.filter(u => u.role === 'Quản trị hệ thống');
        if (user.role === 'Quản trị hệ thống' && adminUsers.length === 1) {
            addToast("Lỗi: Không thể thay đổi vai trò của quản trị viên cuối cùng.");
            setOpenActionMenuId(null);
            return;
        }

        const newRole: User['role'] = user.role === 'Quản trị hệ thống' ? 'Giáo viên' : 'Quản trị hệ thống';
        const updatedUser = { ...user, role: newRole };

        setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
        setRecentlyModifiedId(user.id);
        
        addToast(`Đã đổi vai trò của ${user.name} thành ${newRole}.`);
        setOpenActionMenuId(null);
    };

    const handleDeleteRequest = (usersToDelete: User[]) => {
        if (usersToDelete.length === 0) return;

        if (usersToDelete.some(u => u.id === currentUser.id)) {
            addToast("Lỗi: Bạn không thể xóa tài khoản của chính mình.");
            return;
        }

        const adminUsers = users.filter(u => u.role === 'Quản trị hệ thống');
        const adminsToDelete = usersToDelete.filter(u => u.role === 'Quản trị hệ thống');
        if (adminUsers.length > 0 && adminUsers.length === adminsToDelete.length) {
            addToast("Lỗi: Không thể xóa quản trị viên cuối cùng của hệ thống.");
            return;
        }

        setItemsToDelete({ users: usersToDelete, ids: usersToDelete.map(u => u.id) });
    };

    const confirmDelete = () => {
        if (!itemsToDelete) return;

        setUsers(prevUsers => prevUsers.filter(u => !itemsToDelete.ids.includes(u.id)));
        addToast(`Đã xóa ${itemsToDelete.ids.length} người dùng.`);
        setItemsToDelete(null);
        setSelectedIds(new Set());
    };
    
    const handleConfirmResetPassword = (password: string) => {
        if (!userToResetPassword) return;
        console.log(`Password for user ${userToResetPassword.name} reset to: ${password}`);
        addToast(`Đã đặt lại mật khẩu cho ${userToResetPassword.name}.`);
        setUserToResetPassword(null);
    };

    const handleBulkRoleUpdate = (newRole: User['role']) => {
        setUsers(users => {
            const newUsers = users.map(user => {
                if (selectedIds.has(user.id)) {
                    const adminUsers = users.filter(u => u.role === 'Quản trị hệ thống');
                    if(user.role === 'Quản trị hệ thống' && newRole !== 'Quản trị hệ thống' && adminUsers.length === 1 && adminUsers[0].id === user.id) {
                         addToast(`Không thể thay đổi vai trò của quản trị viên cuối cùng: ${user.name}.`);
                         return user;
                    }
                    return { ...user, role: newRole };
                }
                return user;
            });
            
            const wasCurrentUserUpdated = selectedIds.has(currentUser.id);
            if (wasCurrentUserUpdated) {
                 addToast("Lỗi: Bạn không thể tự thay đổi vai trò của mình trong thao tác hàng loạt.");
                 return users; // Revert changes if current user was included
            }
            return newUsers;
        });
    
        addToast(`Đã cập nhật vai trò cho ${selectedIds.size} người dùng.`);
        setSelectedIds(new Set());
        setIsBulkRoleModalOpen(false);
    };
    
    const getRoleBadgeVariant = (role: User['role']) => (
        { 'Quản trị hệ thống': 'danger', 'Giáo viên': 'info' }[role] || 'default'
    ) as any;

    const getStatusBadgeVariant = (status: User['status']) => (status === 'Hoạt động' ? 'success' : 'warning');
    
    const isAllSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id));

    return (
        <>
            <Card className="shadow-lg border-none bg-white dark:bg-slate-900 h-full flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
                            <Users className="w-6 h-6" /> Quản lý người dùng
                        </CardTitle>
                        {selectedIds.size > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-slate-500">{selectedIds.size} mục đã chọn</span>
                                <Button variant="outline" size="sm" className="text-indigo-600 dark:text-indigo-400 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" onClick={() => setIsBulkRoleModalOpen(true)}>
                                    <Users className="w-4 h-4 mr-2" /> Thay đổi vai trò
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteRequest(users.filter(u => selectedIds.has(u.id)))}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa mục đã chọn
                                </Button>
                            </div>
                        )}
                    </div>
                    <Button onClick={() => setModalState({ mode: 'add' })}>
                        <Plus className="w-4 h-4 mr-2" /> Thêm người dùng mới
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 w-full md:flex-grow">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input 
                                    placeholder="Tìm kiếm theo tên, email, tên đăng nhập..." 
                                    className="pl-10 pr-10"
                                    value={searchInputValue} 
                                    onChange={(e) => setSearchInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                />
                                {searchInputValue && (
                                    <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto rounded-full" onClick={handleClearSearch}>
                                        <XCircle className="w-5 h-5 text-slate-400"/>
                                    </Button>
                                )}
                            </div>
                            <Button onClick={handleSearch} className="flex-shrink-0">
                                <Search className="w-4 h-4 mr-2" />
                                Tìm kiếm
                            </Button>
                        </div>

                        <div className="flex gap-4 w-full md:w-auto flex-shrink-0">
                            <Select onValueChange={(value) => handleSelectFilterChange('roleFilter', value)} value={filters.roleFilter}>
                                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Lọc theo vai trò" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                                    <SelectItem value="Quản trị hệ thống">Quản trị hệ thống</SelectItem>
                                    <SelectItem value="Giáo viên">Giáo viên</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => handleSelectFilterChange('statusFilter', value)} value={filters.statusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Lọc theo trạng thái" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                                    <SelectItem value="Tạm khóa">Tạm khóa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex-grow overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"><Checkbox checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} /></TableHead>
                                    <TableHead>Họ và tên</TableHead>
                                    <TableHead>Tên đăng nhập</TableHead>
                                    <TableHead>Vai trò</TableHead>
                                    <TableHead>Thống kê sử dụng</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.map(user => {
                                    const isCurrentUser = user.id === currentUser.id;
                                    return (
                                        <TableRow 
                                            key={user.id} 
                                            className={user.id === recentlyModifiedId ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}
                                        >
                                            <TableCell><Checkbox checked={selectedIds.has(user.id)} onCheckedChange={(checked) => handleSelect(user.id, Boolean(checked))} /></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <div className="font-medium text-slate-800 dark:text-slate-100">{user.name}</div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">@{user.username}</div>
                                            </TableCell>
                                            <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge></TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    Logins: {user.usageCount}
                                                    {user.role !== 'Quản trị hệ thống' && user.usageLimit != null && ` / ${user.usageLimit}`}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    Tokens: {(user.tokenUsage || 0).toLocaleString('vi-VN')}
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <div className="relative inline-block text-left">
                                                    <Button variant="ghost" size="sm" onClick={() => setOpenActionMenuId(openActionMenuId === user.id ? null : user.id)}>
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </Button>
                                                    {openActionMenuId === user.id && (
                                                        <div ref={actionMenuRef} className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                            <div className="py-1">
                                                                <button onClick={() => { setModalState({ mode: 'edit', user }); setOpenActionMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"><Edit size={16}/> Chỉnh sửa</button>
                                                                <button onClick={() => handleToggleRole(user)} disabled={isCurrentUser} title={isCurrentUser ? "Không thể tự thay đổi vai trò" : ""} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><Zap size={16}/> Đổi vai trò</button>
                                                                <button onClick={() => handleToggleStatus(user)} disabled={isCurrentUser} title={isCurrentUser ? "Không thể tự khóa tài khoản" : ""} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                                                    {user.status === 'Hoạt động' ? <><Lock size={16}/> Tạm khóa</> : <><Unlock size={16}/> Kích hoạt</>}
                                                                </button>
                                                                <button onClick={() => { setUserToResetPassword(user); setOpenActionMenuId(null); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"><KeyRound size={16}/> Đặt lại mật khẩu</button>
                                                                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                                                <button onClick={() => { handleDeleteRequest([user]); setOpenActionMenuId(null); }} disabled={isCurrentUser} title={isCurrentUser ? "Không thể tự xóa tài khoản" : ""} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16}/> Xóa người dùng</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                           <span className="whitespace-nowrap">
                                Hiển thị {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{(currentPage - 1) * itemsPerPage + paginatedUsers.length} trên {sortedUsers.length}
                            </span>
                            <div className="hidden sm:flex items-center gap-2">
                                <Label htmlFor="rows-per-page" className="!mb-0 whitespace-nowrap">Hàng mỗi trang:</Label>
                                <Select onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }} defaultValue={String(DEFAULT_ITEMS_PER_PAGE)}>
                                    <SelectTrigger id="rows-per-page" className="w-20"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 50].map(val => <SelectItem key={val} value={String(val)}>{val}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline ml-1">Trước</span></Button>
                            <span className="text-sm font-medium">{currentPage} / {totalPages > 0 ? totalPages : 1}</span>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><span className="hidden sm:inline mr-1">Sau</span> <ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {(modalState.mode === 'edit' || modalState.mode === 'add') && (
                <UserEditModal
                    isOpen={modalState.mode === 'edit' || modalState.mode === 'add'}
                    onClose={() => setModalState({ mode: null })}
                    onSave={handleSaveUser}
                    initialUser={modalState.mode === 'edit' ? modalState.user : undefined}
                    users={users}
                    allSchools={allSchools}
                    allProfessionalGroups={allProfessionalGroups}
                />
            )}
             {itemsToDelete && (
                <DeleteConfirmationModal 
                    isOpen={!!itemsToDelete}
                    onClose={() => setItemsToDelete(null)}
                    onConfirm={confirmDelete}
                    users={itemsToDelete.users}
                />
            )}
            {userToResetPassword && (
                <ResetPasswordModal
                    isOpen={!!userToResetPassword}
                    onClose={() => setUserToResetPassword(null)}
                    onConfirm={handleConfirmResetPassword}
                    user={userToResetPassword}
                />
            )}
             {isBulkRoleModalOpen && (
                <BulkRoleModal
                    isOpen={isBulkRoleModalOpen}
                    onClose={() => setIsBulkRoleModalOpen(false)}
                    onConfirm={handleBulkRoleUpdate}
                />
            )}
        </>
    );
}


const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}><XCircle className="w-5 h-5" /></Button>
                </div>
                {children}
            </div>
        </div>
    );
};

// --- START: MODAL DEFINITIONS ---

const UserEditModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (userData: Partial<User>, id?: number) => Promise<void>; 
    initialUser?: User, 
    users: User[],
    allSchools: string[],
    allProfessionalGroups: string[]
}> = ({ isOpen, onClose, onSave, initialUser, users, allSchools, allProfessionalGroups }) => {
    const [userData, setUserData] = useState<Partial<User>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setUserData(initialUser || { role: 'Giáo viên', status: 'Hoạt động', avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, usageLimit: 5, password: '' });
            setErrors({});
            setIsSaving(false);
        }
    }, [initialUser, isOpen]);

    const handleFileSelect = (file: File | null) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setErrors(p => ({...p, avatar: 'Ảnh phải nhỏ hơn 5MB.'})); return; }
        if (!['image/jpeg', 'image/png'].includes(file.type)) { setErrors(p => ({...p, avatar: 'Chỉ chấp nhận file JPG, PNG.'})); return; }
        
        const reader = new FileReader();
        reader.onloadend = () => setUserData(prev => ({ ...prev, avatar: reader.result as string }));
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!userData.name?.trim()) newErrors.name = 'Họ và tên không được để trống.';
        
        if (!userData.username?.trim()) {
            newErrors.username = 'Tên đăng nhập không được để trống.';
        } else if (users.some(u => u.username.toLowerCase() === userData.username?.toLowerCase() && u.id !== initialUser?.id)) {
            newErrors.username = 'Tên đăng nhập này đã tồn tại.';
        }

        if (!userData.email?.trim()) {
            newErrors.email = 'Email không được để trống.';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Email không hợp lệ.';
        }
        
        if (!initialUser && !userData.password?.trim()) {
            newErrors.password = 'Mật khẩu tạm thời là bắt buộc.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSaving(true);
        await onSave(userData, initialUser?.id);
        setIsSaving(false);
    };

    const handleInputChange = (field: keyof User, value: string | number) => {
        setUserData(prev => ({...prev, [field]: value}));
        if(errors[field as string]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[field as string];
                return newErrors;
            })
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl transform animate-in fade-in-0 zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Edit size={20}/>
                        {initialUser ? 'Chỉnh sửa thông tin người dùng' : 'Thêm người dùng mới'}
                    </h3>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose}><XCircle className="w-5 h-5" /></Button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <img src={userData.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover"/>
                        <div>
                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2"/>Tải ảnh mới</Button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} />
                             {errors.avatar && <p className="text-xs text-red-500 mt-1">{errors.avatar}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-name" className="flex items-center gap-2"><UserIcon size={16}/>Họ và tên</Label>
                            <Input id="edit-name" value={userData.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="edit-username" className="flex items-center gap-2"><UserIcon size={16}/>Tên đăng nhập</Label>
                            <Input id="edit-username" value={userData.username || ''} onChange={e => handleInputChange('username', e.target.value)} />
                            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="edit-email" className="flex items-center gap-2"><Info size={16}/>Email</Label>
                        <Input id="edit-email" type="email" value={userData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                     {!initialUser && (
                        <div>
                            <Label htmlFor="new-password">Mật khẩu tạm thời</Label>
                            <Input id="new-password" type="password" value={userData.password || ''} onChange={e => handleInputChange('password', e.target.value)} />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                     )}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-school" className="flex items-center gap-2"><BookOpen size={16}/>Đơn vị/Trường</Label>
                             <SelectWithOther id="edit-school" value={userData.school || ''} onValueChange={v => handleInputChange('school', v)} options={allSchools} placeholder="Chọn hoặc nhập trường"/>
                        </div>
                        <div>
                            <Label htmlFor="edit-profGroup" className="flex items-center gap-2"><Users size={16}/>Tổ chuyên môn</Label>
                            <SelectWithOther id="edit-profGroup" value={userData.profGroup || ''} onValueChange={v => handleInputChange('profGroup', v)} options={allProfessionalGroups} placeholder="Chọn hoặc nhập tổ"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <Label className="flex items-center gap-2"><Shield size={16}/>Vai trò</Label>
                            <Select onValueChange={v => handleInputChange('role', v)} value={userData.role}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Giáo viên">Giáo viên</SelectItem>
                                    <SelectItem value="Quản trị hệ thống">Quản trị hệ thống</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="flex items-center gap-2"><Info size={16}/>Trạng thái</Label>
                            <Select onValueChange={v => handleInputChange('status', v)} value={userData.status}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                                    <SelectItem value="Tạm khóa">Tạm khóa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="edit-usageLimit" className="flex items-center gap-2"><Zap size={16}/>Số lần đăng nhập tối đa</Label>
                        <Input id="edit-usageLimit" type="number" value={userData.usageLimit || ''} onChange={e => handleInputChange('usageLimit', Number(e.target.value))} disabled={userData.role === 'Quản trị hệ thống'} />
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t dark:border-slate-800 gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>Hủy</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                        Lưu thay đổi
                    </Button>
                </div>
            </form>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; users: User[] }> = ({ isOpen, onClose, onConfirm, users }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa">
        <div className="p-6">
            <p>Bạn có chắc chắn muốn xóa {users.length} người dùng sau không? Hành động này không thể hoàn tác.</p>
            <ul className="list-disc list-inside mt-2 text-sm text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto">
                {users.map(u => <li key={u.id}>{u.name} ({u.username})</li>)}
            </ul>
        </div>
        <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 gap-2">
            <Button variant="ghost" onClick={onClose}>Hủy</Button>
            <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Xác nhận xóa</Button>
        </div>
    </Modal>
);

const ResetPasswordModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (password: string) => void; user: User }> = ({ isOpen, onClose, onConfirm, user }) => {
    const [password, setPassword] = useState('');
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Đặt lại mật khẩu cho ${user.name}`}>
            <div className="p-6 space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input id="new-password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
                 <p className="text-xs text-slate-500">Người dùng sẽ cần phải đổi mật khẩu này sau khi đăng nhập.</p>
            </div>
            <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 gap-2">
                <Button variant="ghost" onClick={onClose}>Hủy</Button>
                <Button onClick={() => onConfirm(password)} disabled={!password}>Đặt lại</Button>
            </div>
        </Modal>
    );
};

const BulkRoleModal: React.FC<{ isOpen: boolean, onClose: () => void, onConfirm: (newRole: User['role']) => void }> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedRole, setSelectedRole] = useState<User['role']>('Giáo viên');
    return (
         <Modal isOpen={isOpen} onClose={onClose} title="Thay đổi vai trò hàng loạt">
            <div className="p-6 space-y-2">
                <Label>Chọn vai trò mới</Label>
                <Select onValueChange={(v) => setSelectedRole(v as User['role'])} value={selectedRole}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Giáo viên">Giáo viên</SelectItem>
                        <SelectItem value="Quản trị hệ thống">Quản trị hệ thống</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="flex justify-end p-4 bg-slate-50 dark:bg-slate-800/50 gap-2">
                <Button variant="ghost" onClick={onClose}>Hủy</Button>
                <Button onClick={() => onConfirm(selectedRole)}>Áp dụng</Button>
            </div>
        </Modal>
    );
};