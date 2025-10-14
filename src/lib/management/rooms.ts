import { prisma } from "@/lib/database/prisma";

export interface CreateRoomData {
  name: string;
  price: number;
  allowDogs?: boolean;
}

export async function createRoom(hotelSlug: string, roomData: CreateRoomData) {
  // Vérifier que l'établissement existe
  const establishment = await prisma.establishment.findUnique({
    where: { slug: hotelSlug },
  });

  if (!establishment) {
    throw new Error("Établissement non trouvé");
  }

  // Créer la place
  const room = await prisma.room.create({
    data: {
      hotelSlug,
      name: roomData.name.trim(),
      price: roomData.price,
      allowDogs: roomData.allowDogs ?? false,
      isActive: true,
    },
  });

  return room;
}

export async function updateRoom(
  roomId: string,
  roomData: Partial<CreateRoomData>
) {
  const updateData: Partial<{
    name: string;
    price: number;
    allowDogs: boolean;
  }> = {};

  if (roomData.name !== undefined) {
    updateData.name = roomData.name.trim();
  }

  if (roomData.price !== undefined) {
    updateData.price = roomData.price;
  }

  if (roomData.allowDogs !== undefined) {
    updateData.allowDogs = roomData.allowDogs;
  }

  const room = await prisma.room.update({
    where: { id: roomId },
    data: updateData,
  });

  return room;
}

export async function deleteRoom(roomId: string) {
  // Vérifier s'il y a des réservations futures pour cette place
  const futureBookings = await prisma.booking.findFirst({
    where: {
      roomId,
      bookingDate: {
        gte: new Date(),
      },
    },
  });

  if (futureBookings) {
    throw new Error(
      "Impossible de supprimer une place avec des réservations existantes"
    );
  }

  // Suppression définitive de la place
  const room = await prisma.room.delete({
    where: { id: roomId },
  });

  return room;
}

export async function getRoomsForHotel(
  hotelSlug: string,
  includeInactive: boolean = false
) {
  const rooms = await prisma.room.findMany({
    where: {
      hotelSlug,
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return rooms;
}

export async function getRoomById(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  return room;
}
