@echo off
echo ===== 本地构建微信API Docker镜像 =====
echo.

REM 设置变量
set IMAGE_NAME=wechat-api
set TAG=latest
set REGISTRY=ghcr.io/kyeo-hub/wechat-api-proxy

REM 检查Docker是否运行
echo 1. 检查Docker环境:
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 错误: Docker未运行或无法访问
    pause
    exit /b 1
)
echo Docker环境正常
echo.

REM 构建镜像
echo 2. 构建Docker镜像:
docker build -t %IMAGE_NAME%:%TAG% .
if %ERRORLEVEL% neq 0 (
    echo 错误: 镜像构建失败
    pause
    exit /b 1
)
echo 镜像构建成功: %IMAGE_NAME%:%TAG%
echo.

REM 显示镜像信息
echo 3. 镜像信息:
docker images | findstr %IMAGE_NAME%
echo.

REM 询问是否推送到GitHub Registry
set /p PUSH_REGISTRY="是否推送到GitHub Registry? (y/n): "
if /i "%PUSH_REGISTRY%"=="y" (
    echo 4. 推送镜像到GitHub Registry:
    
    REM 标记镜像
    docker tag %IMAGE_NAME%:%TAG% %REGISTRY%:%TAG%
    
    REM 推送镜像
    echo 请先确保已登录GitHub Registry:
    echo docker login ghcr.io -u YOUR_USERNAME
    pause
    
    docker push %REGISTRY%:%TAG%
    
    if %ERRORLEVEL% neq 0 (
        echo 错误: 镜像推送失败
    ) else (
        echo 镜像推送成功: %REGISTRY%:%TAG%
    )
)

echo.
echo ===== 构建完成 =====
pause