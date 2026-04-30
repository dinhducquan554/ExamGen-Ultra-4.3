import React from 'react';
import { User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Printer, Users } from '../icons';
import { Badge } from '../ui/Badge';

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Danh sách người dùng</title>');
      printWindow.document.write(`
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #999; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          h1 { text-align: center; margin-bottom: 20px; }
          img { display: none; } /* Hide avatars in print */
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write('<h1>Danh sách người dùng</h1>');
      printWindow.document.write('<table>');
      printWindow.document.write('<thead><tr><th>STT</th><th>Họ và tên</th><th>Tên đăng nhập</th><th>Email</th><th>Vai trò</th><th>Trường</th><th>Tổ chuyên môn</th></tr></thead>');
      printWindow.document.write('<tbody>');
      users.forEach((user, index) => {
        printWindow.document.write(`
          <tr>
            <td>${index + 1}</td>
            <td>${user.name || ''}</td>
            <td>${user.username || ''}</td>
            <td>${user.email || ''}</td>
            <td>${user.role || ''}</td>
            <td>${user.school || ''}</td>
            <td>${user.profGroup || ''}</td>
          </tr>
        `);
      });
      printWindow.document.write('</tbody></table>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };
  
  const getRoleBadgeVariant = (role: User['role']) => (
    { 'Quản trị hệ thống': 'danger', 'Giáo viên': 'info' }[role] || 'default'
  ) as any;

  return (
    <Card className="shadow-lg border-none bg-white dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-100">
          <Users className="w-6 h-6" />
          Danh sách người dùng hệ thống
        </CardTitle>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          In danh sách
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul role="list" className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <li key={user.id} className="py-4 flex items-center space-x-4">
                <img className="h-12 w-12 rounded-full flex-shrink-0 object-cover" src={user.avatar} alt={`Avatar of ${user.name}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                    {user.email}
                  </p>
                   <div className="mt-1">
                     <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                   </div>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-300 flex-shrink-0 hidden sm:block">
                    <p>{user.school}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.profGroup}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;