'use client';

import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { wsService } from '../services/websocketService';
import {
  handleRealtimePunch,
  handleRealtimeDelete,
  fetchAttendanceStatsAsync,
} from '../redux/slices/attendanceSlice';
import { mapBackendToAttendanceRecord } from '../services/attendanceService';
import { toast } from 'sonner';

export const useAttendanceWebSocket = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  useEffect(() => {
    const user = currentUserRef.current;
    wsService.connect(user?.companyId, user?.id);

    const unsubscribe = wsService.subscribe((msg: any) => {
      if (!msg || !msg.event) return;

      if (msg.event === 'ATTENDANCE_PUNCH' || msg.event === 'ATTENDANCE_UPDATE') {
        if (msg.data) {
          const mappedRecord = mapBackendToAttendanceRecord(msg.data);
          dispatch(handleRealtimePunch(mappedRecord));

          const activeUser = currentUserRef.current;
          if (activeUser?.companyId) {
            dispatch(fetchAttendanceStatsAsync({ companyId: activeUser.companyId }));
          }

          const actionText = msg.action === 'CLOCK_OUT' ? 'Clocked Out' : 'Clocked In';
          toast.success(
            `Live: ${msg.employee_name || mappedRecord.employeeName} ${actionText} at ${mappedRecord.checkIn || mappedRecord.checkInTime || ''}`,
            {
              duration: 3000,
              id: `punch_${mappedRecord.employeeId}_${mappedRecord.date}`,
            }
          );
        }
      } else if (msg.event === 'ATTENDANCE_DELETE') {
        dispatch(
          handleRealtimeDelete({
            recordId: msg.record_id,
            employeeId: msg.employee_id,
          })
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);
};
