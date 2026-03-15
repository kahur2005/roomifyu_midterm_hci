import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Users,
  XCircle,
  FileText,
  Wrench,
  AlertCircle,
  Building,
  Search,
  Eye,
  Tag,
  Settings,
  Filter,
} from 'lucide-react';
import React, { useState } from 'react';
import { bookings } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import { Switch } from '../components/ui/switch';

export function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeTypeFilter, setPurposeTypeFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const [autoApprovalSettings, setAutoApprovalSettings] = useState({
    personal: 'none', // 'none' | 'approve' | 'reject'
    university: 'none',
    committee: 'none',
  });

  const allBookings = bookings.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredBookings = allBookings.filter(booking => {
    if (searchQuery && !booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !booking.userName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }
    if (purposeTypeFilter !== 'all' && booking.bookingPurposeType !== purposeTypeFilter) {
      return false;
    }
    return true;
  });

  const handleApprove = (booking: typeof bookings[0]) => {
    toast.success(`Booking for ${booking.roomName} has been approved.`);
    setSelectedBooking(null);
  };

  const handleReject = () => {
    if (!selectedBooking) return;
    toast.success(`Booking for ${selectedBooking.roomName} has been rejected.`);
    setShowRejectDialog(false);
    setSelectedBooking(null);
    setRejectReason('');
  };

  const openRejectDialog = (booking: typeof bookings[0]) => {
    setSelectedBooking(booking);
    setShowRejectDialog(true);
  };

  const getAutoActionForType = (type: 'personal' | 'university' | 'committee') => {
    return autoApprovalSettings[type];
  };

  const toggleAutoSetting = (type: 'personal' | 'university' | 'committee', action: 'approve' | 'reject') => {
    setAutoApprovalSettings(prev => {
      const currentValue = prev[type];
      const newValue = currentValue === action ? 'none' : action;
      
      // Save to localStorage
      const newSettings = { ...prev, [type]: newValue };
      localStorage.setItem('autoApprovalSettings', JSON.stringify(newSettings));
      
      // Show toast
      if (newValue === 'approve') {
        toast.success(`Auto-approval enabled for ${type === 'personal' ? 'Personal Use' : type === 'university' ? 'University Purposes' : 'Committee Purposes'} bookings`);
      } else if (newValue === 'reject') {
        toast.success(`Auto-rejection enabled for ${type === 'personal' ? 'Personal Use' : type === 'university' ? 'University Purposes' : 'Committee Purposes'} bookings`);
      } else {
        toast.info(`Automatic action disabled for ${type === 'personal' ? 'Personal Use' : type === 'university' ? 'University Purposes' : 'Committee Purposes'} bookings`);
      }
      
      return newSettings;
    });
  };

  // Load auto-approval settings from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('autoApprovalSettings');
    if (saved) {
      try {
        setAutoApprovalSettings(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const getPurposeTypeBadge = (type: 'personal' | 'university' | 'committee') => {
    const config = {
      personal: { label: 'Personal', class: 'bg-blue-100 text-blue-700 border-blue-200' },
      university: { label: 'University', class: 'bg-purple-100 text-purple-700 border-purple-200' },
      committee: { label: 'Committee', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    };
    const { label, class: className } = config[type];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border inline-block ${className}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Approval Management</h1>
        <p className="text-muted-foreground">
          Review and manage room booking requests
        </p>
      </div>

      {/* Auto-Approval Settings Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Auto-Approval Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAutoSettings(!showAutoSettings)}
            >
              {showAutoSettings ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showAutoSettings && (
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure automatic approval or rejection rules for different booking purpose types
            </p>
            <div className="space-y-4">
              {/* Personal Use */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded text-sm font-medium">
                    Personal Use
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {autoApprovalSettings.personal === 'approve' && '• Auto-approve enabled'}
                    {autoApprovalSettings.personal === 'reject' && '• Auto-reject enabled'}
                    {autoApprovalSettings.personal === 'none' && '• Manual review required'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoApprovalSettings.personal === 'approve'}
                      onCheckedChange={() => toggleAutoSetting('personal', 'approve')}
                      disabled={autoApprovalSettings.personal === 'reject'}
                    />
                    <Label className="text-sm text-accent cursor-pointer">Auto-Approve</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoApprovalSettings.personal === 'reject'}
                      onCheckedChange={() => toggleAutoSetting('personal', 'reject')}
                      disabled={autoApprovalSettings.personal === 'approve'}
                    />
                    <Label className="text-sm text-destructive cursor-pointer">Auto-Reject</Label>
                  </div>
                </div>
              </div>

              {/* University Purposes */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-sm font-medium">
                    University Purposes
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {autoApprovalSettings.university === 'approve' && '• Auto-approve enabled'}
                    {autoApprovalSettings.university === 'reject' && '• Auto-reject enabled'}
                    {autoApprovalSettings.university === 'none' && '• Manual review required'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoApprovalSettings.university === 'approve'}
                      onCheckedChange={() => toggleAutoSetting('university', 'approve')}
                      disabled={autoApprovalSettings.university === 'reject'}
                    />
                    <Label className="text-sm text-accent cursor-pointer">Auto-Approve</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoApprovalSettings.university === 'reject'}
                      onCheckedChange={() => toggleAutoSetting('university', 'reject')}
                      disabled={autoApprovalSettings.university === 'approve'}
                    />
                    <Label className="text-sm text-destructive cursor-pointer">Auto-Reject</Label>
                  </div>
                </div>
              </div>

              {/* Committee Purposes */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded text-sm font-medium">
                    Committee Purposes
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {autoApprovalSettings.committee === 'approve' && '• Auto-approve enabled'}
                    {autoApprovalSettings.committee === 'reject' && '• Auto-reject enabled'}
                    {autoApprovalSettings.committee === 'none' && '• Manual review required'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoApprovalSettings.committee === 'approve'}
                      onCheckedChange={() => toggleAutoSetting('committee', 'approve')}
                      disabled={autoApprovalSettings.committee === 'reject'}
                    />
                    <Label className="text-sm text-accent cursor-pointer">Auto-Approve</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoApprovalSettings.committee === 'reject'}
                      onCheckedChange={() => toggleAutoSetting('committee', 'reject')}
                      disabled={autoApprovalSettings.committee === 'approve'}
                    />
                    <Label className="text-sm text-destructive cursor-pointer">Auto-Reject</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by room or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={purposeTypeFilter} onValueChange={setPurposeTypeFilter}>
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder="Filter by purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purpose Types</SelectItem>
            <SelectItem value="personal">Personal Use</SelectItem>
            <SelectItem value="university">University Purposes</SelectItem>
            <SelectItem value="committee">Committee Purposes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.roomName}</p>
                          <p className="text-sm text-muted-foreground">{booking.building}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.userName}</TableCell>
                      <TableCell>
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        {booking.startTime} - {booking.endTime}
                      </TableCell>
                      <TableCell>
                        {getPurposeTypeBadge(booking.bookingPurposeType)}
                        {getAutoActionForType(booking.bookingPurposeType) !== 'none' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {getAutoActionForType(booking.bookingPurposeType) === 'approve' ? '🟢 Auto-approve' : '🔴 Auto-reject'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-accent hover:text-accent"
                                onClick={() => handleApprove(booking)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => openRejectDialog(booking)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Sheet */}
      <Sheet open={!!selectedBooking && !showRejectDialog} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <SheetContent className="w-full md:max-w-lg overflow-y-auto">
          {selectedBooking && (
            <>
              <SheetHeader>
                <SheetTitle>Booking Details</SheetTitle>
                <SheetDescription>
                  Review the booking information and take action
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                
                {/* Room Information Card */}
                <div className="p-4 border rounded-lg space-y-3 bg-card">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Room</Label>
                      <p className="text-lg font-semibold mt-1">{selectedBooking.roomName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{selectedBooking.building}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* User Information */}
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Requested By</Label>
                      <p className="font-semibold mt-1">{selectedBooking.userName}</p>
                    </div>
                  </div>
                </div>
                
                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <p className="font-medium text-sm mt-1 leading-tight">
                          {new Date(selectedBooking.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">Time</Label>
                        <p className="font-medium text-sm mt-1 leading-tight">
                          {selectedBooking.startTime} - {selectedBooking.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Purpose & Attendees */}
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Purpose</Label>
                        <p className="font-medium mt-1">{selectedBooking.purpose}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Tag className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Booking Type</Label>
                        <div className="mt-2">
                          <span className={`px-3 py-1.5 rounded text-sm font-medium border inline-block ${selectedBooking.bookingPurposeType === 'personal' ? 'bg-blue-100 text-blue-700 border-blue-200' : selectedBooking.bookingPurposeType === 'university' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                            {selectedBooking.bookingPurposeType === 'personal' ? 'Personal Use' : selectedBooking.bookingPurposeType === 'university' ? 'University Purposes' : 'Committee Purposes'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Users className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Number of Attendees</Label>
                        <p className="font-medium mt-1">{selectedBooking.attendees} people</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Equipment Required */}
                {selectedBooking.equipment.length > 0 && (
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Wrench className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Equipment Required</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedBooking.equipment.map(eq => (
                            <span key={eq} className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Additional Notes */}
                {selectedBooking.notes && (
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Additional Notes</Label>
                        <p className="text-sm mt-1 text-muted-foreground leading-relaxed">{selectedBooking.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Recurring Badge */}
                {selectedBooking.isRecurring && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <p className="text-sm font-medium text-amber-700">
                        This is a recurring booking request
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedBooking.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={() => handleApprove(selectedBooking)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this booking request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for Rejection</Label>
              <Textarea
                id="reject-reason"
                placeholder="Enter reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}