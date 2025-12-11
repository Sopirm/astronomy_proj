program LegacyCSV;

{$mode objfpc}{$H+}

uses
  SysUtils, DateUtils, Process; // Добавлен Process

function GetEnvDef(const name, def: string): string;
var v: string;
begin
  v := GetEnvironmentVariable(name);
  if v = '' then Exit(def) else Exit(v);
end;

function RandFloat(minV, maxV: Double): Double;
begin
  Result := minV + Random * (maxV - minV);
end;

procedure GenerateAndCopy();
var
  outDir, fn, fullpath, pghost, pgport, pguser, pgpass, pgdb, copyCmd: string;
  f: TextFile;
  ts: string;
  randomDescIndex: Integer; // Новая переменная для случайного индекса
  descriptionString: string; // Новая переменная для строки описания
begin
  outDir := GetEnvDef('CSV_OUT_DIR', '/data/csv');
  ts := FormatDateTime('yyyymmdd_hhnnss', Now);
  fn := 'telemetry_' + ts + '.csv';
  fullpath := IncludeTrailingPathDelimiter(outDir) + fn;

  // write CSV
  AssignFile(f, fullpath);
  Rewrite(f);
  Writeln(f, 'recorded_at,voltage,temp,source_file,boolean_status,numeric_value,string_description');

  // Определяем случайное описание
  randomDescIndex := Random(3);
  case randomDescIndex of
    0: descriptionString := 'Стабильно';
    1: descriptionString := 'Небольшие колебания';
    else descriptionString := 'Активность обнаружена';
  end;

  Writeln(f, FormatDateTime('yyyy-mm-dd hh:nn:ss', Now) + ',' +
             FormatFloat('0.00', RandFloat(3.2, 12.6)) + ',' +
             FormatFloat('0.00', RandFloat(-50.0, 80.0)) + ',' +
             fn + ',' +
             BoolToStr(Random(2) = 0, True) + ',' + // boolean_status
             FormatFloat('0.00', RandFloat(100.0, 1000.0)) + ',' + // numeric_value
             descriptionString // Используем переменную
             );
  CloseFile(f);

  // COPY into Postgres
  pghost := GetEnvDef('PGHOST', 'db');
  pgport := GetEnvDef('PGPORT', '5432');
  pguser := GetEnvDef('PGUSER', 'monouser');
  pgpass := GetEnvDef('PGPASSWORD', 'monopass');
  pgdb   := GetEnvDef('PGDATABASE', 'monolith');

  copyCmd := 'psql "host=' + pghost + ' port=' + pgport + ' user=' + pguser + ' dbname=' + pgdb + '" ' +
             '-c "\copy telemetry_legacy(recorded_at, voltage, temp, source_file, boolean_status, numeric_value, string_description) FROM ''' + fullpath + ''' WITH (FORMAT csv, HEADER true)"';
  
  SetEnvironmentVariable('PGPASSWORD', pgpass);
  fpSystem(copyCmd);
end;

var period: Integer;
begin
  Randomize;
  period := StrToIntDef(GetEnvDef('GEN_PERIOD_SEC', '300'), 300);
  while True do
  begin
    try
      GenerateAndCopy();
    except
      on E: Exception do
        WriteLn('Legacy error: ', E.Message);
    end;
    Sleep(period * 1000);
  end;
end.
