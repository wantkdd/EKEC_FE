import { API, privateAPI } from "./httpClient";

export type AlbumListItem = {
	albumId: number;
	imageName: string;
};

export async function fetchAlbumList(crewId: string | number): Promise<AlbumListItem[]> {
	const url = `/crew/${crewId}/album/`;
	const { data } = await API.get(url, { withCredentials: true });
	if (data?.resultType !== "SUCCESS") {
		throw new Error(data?.error?.reason || "Album list failed");
	}
	return (Array.isArray(data.data) ? data.data : []) as AlbumListItem[];
}

export async function uploadAlbumImage(
	crewId: string | number,
	file: File
): Promise<{ albumId: number; imageName: string }> {
	const url = `/crew/${crewId}/album/`;
	const form = new FormData();
	form.append("image", file);
	const { data } = await privateAPI.post(url, form, {
		headers: { "Content-Type": "multipart/form-data" },
		withCredentials: true,
	});
	if (data?.resultType !== "SUCCESS") {
		throw new Error(data?.error?.reason || "Album upload failed");
	}
	return data.data as { albumId: number; imageName: string };
}


