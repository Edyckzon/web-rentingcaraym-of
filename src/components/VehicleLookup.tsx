'use client';
import {useSearchParams} from 'next/navigation';
import VehicleDetail from './VehicleDetail';
export default function VehicleLookup(){return <VehicleDetail slug={useSearchParams().get('id')??''}/>;}
