import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "data.json");

const loadData = () => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return fileContent ? JSON.parse(fileContent) : [];
  }
  return [];
};

const saveData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

export async function POST(req) {
  const existingData = loadData();
  const newData = await req.json();
  existingData.push(newData);
  saveData(existingData);

  return NextResponse.json(
    { message: "Data saved successfully", data: newData },
    { status: 200 }
  );
}

export async function GET() {
  const data = loadData();
  return NextResponse.json(data, { status: 200 });
}

export async function PUT(req) {
  const existingData = loadData();
  const updatedData = await req.json();
  const index = existingData.findIndex((item) => item.id === updatedData.id);

  if (index !== -1) {
    existingData[index] = updatedData;
    saveData(existingData);
    return NextResponse.json(
      { message: "Data updated successfully", data: updatedData },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Data not found" }, { status: 404 });
  }
}

export async function DELETE(req) {
  const existingData = loadData();
  const { id } = await req.json();
  const index = existingData.findIndex((item) => item.id === id);

  if (index !== -1) {
    const deletedData = existingData.splice(index, 1);
    saveData(existingData);
    return NextResponse.json(
      { message: "Data deleted successfully", data: deletedData },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Data not found" }, { status: 404 });
  }
}
